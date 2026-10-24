import { isAdmin } from "@/lib/admin-auth";
import { clearSample, writeSample } from "@/lib/store";
import { generateSample } from "@/lib/sample-data";

// Load or clear clearly-labelled sample data, so the dashboard can be previewed before real traffic.
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { action } = await req.json().catch(() => ({ action: "" }));
  if (action === "load") await writeSample(generateSample());
  else if (action === "clear") await clearSample();
  else return Response.json({ error: "Unknown action" }, { status: 400 });
  return Response.json({ ok: true });
}
