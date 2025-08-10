export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  return Response.json({ message: `Approved claim ${id}` });
}