import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (email === "admin@lotus.dev" && password === "abc123@") {
    return Response.json({
      token: `dev-admin.${Buffer.from(email).toString("base64")}.${Date.now()}`,
      role: "admin",
    });
  }

  return Response.json({ message: "Invalid credentials" }, { status: 403 });
}
