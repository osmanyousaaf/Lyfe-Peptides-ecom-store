import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/db";

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

// Serves images uploaded from the admin (they live outside public/, so they survive rebuilds).
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const file = path.resolve(UPLOAD_DIR, ...parts);
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!file.startsWith(path.resolve(UPLOAD_DIR) + path.sep) || !type) return new Response("Not found", { status: 404 });
  try {
    const body = await fs.readFile(file);
    return new Response(body, {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
