import Anthropic from "@anthropic-ai/sdk";
import { offlineAnswer, supportSystemPrompt } from "@/lib/support";

// Customer support chat. Streams plain text back to the widget.
// With ANTHROPIC_API_KEY set it answers with Claude; without one it falls back to built-in FAQ answers.

const MAX_TURNS = 20;
const MAX_CHARS = 1500;

// Small per-IP limit so the paid endpoint can't be hammered: 30 messages per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 30;
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

type Turn = { role: "user" | "assistant"; content: string };

function parse(body: unknown): Turn[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) return null;
  const raw = (body as { messages: unknown[] }).messages.slice(-MAX_TURNS);
  const turns: Turn[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, MAX_CHARS);
    if (text) turns.push({ role, content: text });
  }
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") return null;
  return turns;
}

const textStream = (chunks: AsyncIterable<string> | string[]) =>
  new Response(
    new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        try {
          for await (const c of chunks) controller.enqueue(enc.encode(c));
        } catch {
          controller.enqueue(enc.encode("\n\nSorry, something went wrong. Please try again, or email info@lyfepeptidescanada.com."));
        }
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }
  );

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

async function* claudeReply(turns: Turn[]): AsyncGenerator<string> {
  const stream = client!.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    output_config: { effort: "low" },
    // if a safety classifier declines, retry server-side on Anthropic's recommended model
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: supportSystemPrompt(), cache_control: { type: "ephemeral" } }],
    messages: turns,
  });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") yield event.delta.text;
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") {
    yield "\n\nI can't help with that one here. For anything else, email info@lyfepeptidescanada.com.";
  } else if (final.stop_reason === "max_tokens") {
    yield "…";
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) {
    return new Response("You're sending messages quickly. Please wait a few minutes, or email info@lyfepeptidescanada.com.", {
      status: 429,
    });
  }
  let turns: Turn[] | null = null;
  try {
    turns = parse(await req.json());
  } catch {}
  if (!turns) return new Response("Bad request", { status: 400 });

  if (!client) return textStream([offlineAnswer(turns[turns.length - 1].content)]);
  return textStream(claudeReply(turns));
}
