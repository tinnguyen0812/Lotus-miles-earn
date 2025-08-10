import { claims } from "../data";

export const revalidate = 0;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }   // ⬅️ params là Promise
) {
  const { id } = await ctx.params;            // ⬅️ await trước khi dùng
  const found = claims.find(c => c.id === id);
  if (!found) return Response.json({ message: "Not found" }, { status: 404 });
  return Response.json(found);
}