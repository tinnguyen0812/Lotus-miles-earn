import { NextRequest } from "next/server";
import { claims } from "./data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const status = searchParams.get("status"); // pending/approved/rejected
  const filtered = claims.filter(c => {
    const okStatus = !status || c.status === status;
    const hay = `${c.member.name} ${c.member.email} ${c.member.id} ${c.id}`.toLowerCase();
    const okQ = !q || hay.includes(q);
    return okStatus && okQ;
  });
  return Response.json(filtered);
}
