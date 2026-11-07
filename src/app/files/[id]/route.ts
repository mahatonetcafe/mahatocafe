import { currentUser } from "@/lib/auth";
import { readStored } from "@/lib/files";
import { getFileByPublicId, getOrderById } from "@/lib/queries";

export const dynamic = "force-dynamic";

const notFound = () => new Response("Not found", { status: 404 });

/**
 * The only way to read a stored file. Admins can read everything. Customers can read
 * only their own receipt: documents they uploaded are not available to them again.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return new Response("Login required", { status: 401 });

  const file = await getFileByPublicId((await ctx.params).id);
  const order = file && await getOrderById(file.orderId);
  if (!file || !order) return notFound();
  if (file.deletedAt) return notFound();
  if (user.role !== "admin" && (file.kind !== "receipt" || order.userId !== user.id)) return notFound();

  let data: Buffer;
  try {
    data = await readStored(file);
  } catch (e) {
    console.error(e);
    return notFound();
  }

  const ascii = file.originalName.replace(/[^\x20-\x7e]|["\\]/g, "_");
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(data.length),
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
