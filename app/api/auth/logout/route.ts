import { NextResponse } from "next/server";

// POST /api/auth/logout - clears authentication cookie
export async function POST() {
  // Respond with a cleared auth_token cookie
  const response = NextResponse.json(
    { message: "Logged out" },
    { status: 200 }
  );
  response.cookies.set({
    name: "auth_token",
    value: "",
    maxAge: 0,
    path: "/",
  });
  return response;
}
