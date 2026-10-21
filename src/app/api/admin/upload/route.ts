import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { adminOr401 } from "@/lib/admin-auth";
import { UPLOAD_DIR } from "@/lib/db";

const EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};
const MAX_BYTES = 8 * 1024 * 1024;

// POST multipart form with one or more "file" fields; returns { urls: ["/uploads/…"] }.
export async function POST(req: Request) {
  const denied = await adminOr401();
  if (denied) return denied;

  const form = await req.formData().catch(() => null);
  const files = (form?.getAll("file") ?? []).filter((f): f is File => f instanceof File);
  if (!files.length) return Response.json({ error: "No file received." }, { status: 400 });

  const urls: string[] = [];
  for (const f of files) {
    const ext = EXT[f.type];
    if (!ext) return Response.json({ error: `${f.name}: use PNG, JPG, WebP, GIF or AVIF.` }, { status: 400 });
    if (f.size > MAX_BYTES) return Response.json({ error: `${f.name} is over 8 MB.` }, { status: 400 });
    const base = path.basename(f.name, path.extname(f.name)).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "image";
    const name = `${base}-${randomBytes(4).toString("hex")}${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await f.arrayBuffer()));
    urls.push(`/uploads/${name}`);
  }
  return Response.json({ urls });
}
