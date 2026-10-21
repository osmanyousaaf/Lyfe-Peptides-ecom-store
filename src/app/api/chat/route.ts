import Anthropic from "@anthropic-ai/sdk";
import { CHAT_LIMITS, PRODUCT_TOKEN, type ChatEvent, type ChatTurn } from "@/lib/chat";
import { chatProduct, localReply, systemPrompt } from "@/lib/chat-knowledge";
import { SITE } from "@/lib/site";

const MODEL = "claude-opus-5-5";

// A small per-IP limit keeps one visitor from running up the API bill.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function parseTurns(body: unknown): ChatTurn[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const turns: ChatTurn[] = [];
  for (const m of raw.slice(-CHAT_LIMITS.maxTurns)) {
    const role = (m as ChatTurn)?.role;
    const content = (m as ChatTurn)?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, CHAT_LIMITS.maxTurnChars);
    if (!text) continue;
    // merge accidental repeats so roles alternate, as the API requires
    const prev = turns[turns.length - 1];
    if (prev && prev.role === role) prev.content += `\n\n${text}`;
    else turns.push({ role, content: text });
  }
  while (turns.length && turns[0].role !== "user") turns.shift();
  const last = turns[turns.length - 1];
  if (!last || last.role !== "user" || last.content.length > CHAT_LIMITS.maxUserChars) return null;
  return turns;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) {
    return Response.json({ error: "You're sending messages quickly. Give it a minute and try again." }, { status: 429 });
  }

  let turns: ChatTurn[] | null = null;
  try {
    turns = parseTurns(await req.json());
  } catch {
    /* falls through to the 400 */
  }
  if (!turns) {
    return Response.json({ error: `Messages must be text under ${CHAT_LIMITS.maxUserChars} characters.` }, { status: 400 });
  }
  const history = turns;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: ChatEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));

      // Forward text, announcing each valid product token before the text that contains it.
      let full = "";
      const announced = new Set<string>();
      const emitText = (chunk: string) => {
        full += chunk;
        for (const m of full.matchAll(PRODUCT_TOKEN)) {
          const slug = m[1];
          if (announced.has(slug)) continue;
          announced.add(slug);
          const product = chatProduct(slug);
          if (product) send({ type: "product", product });
        }
        send({ type: "text", text: chunk });
      };

      const local = async () => {
        const reply = localReply(history[history.length - 1].content);
        // stream word by word, keeping product tokens whole
        const parts = reply.text.split(/(\[\[product:[a-z0-9-]+\]\]|\s+)/).filter(Boolean);
        for (const part of parts) {
          emitText(part);
          if (!/^\s+$/.test(part)) await sleep(part.startsWith("[[") ? 90 : 22);
        }
        send({ type: "suggestions", items: reply.suggestions });
        send({ type: "done", source: "local" });
      };

      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          await local();
          return;
        }
        try {
          const client = new Anthropic();
          const s = client.beta.messages.stream({
            model: MODEL,
            max_tokens: 4096,
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            output_config: { effort: "low" },
            system: [{ type: "text", text: systemPrompt(), cache_control: { type: "ephemeral" } }],
            messages: history,
          });
          for await (const event of s) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              emitText(event.delta.text);
            }
          }
          const final = await s.finalMessage();
          if (final.stop_reason === "refusal" && !full.trim()) {
            await local();
            return;
          }
          send({ type: "done", source: "ai" });
        } catch (err) {
          if (err instanceof Anthropic.APIError) console.error(`chat: API error ${err.status}: ${err.message}`);
          else console.error("chat:", err);
          if (!full.trim()) await local();
          else {
            send({ type: "text", text: `\n\nSorry, I lost my connection there. You can reach the team at ${SITE.email}.` });
            send({ type: "done", source: "ai" });
          }
        }
      } catch {
        send({ type: "error", message: "Something went wrong. Please try again." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
