import { adminOr401 } from "@/lib/admin-auth";
import { liveData } from "@/lib/analytics-view";

// Who is on the site right now; the analytics page polls this every few seconds.
export async function GET() {
  const denied = await adminOr401();
  if (denied) return denied;
  return Response.json(liveData(), { headers: { "Cache-Control": "no-store" } });
}
