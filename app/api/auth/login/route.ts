import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Owner } from "@/models/Owner";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    await dbConnect();

    const ownerDoc = await Owner.findOne({ email });
    if (!ownerDoc) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // @ts-ignore - comparePassword is defined in schema methods
    const isMatch = await ownerDoc.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Prepare token payload
    const payload: any = {
      userId: ownerDoc._id.toString(),
      role: ownerDoc.role,
    };
    if (ownerDoc.role === "owner" && ownerDoc.companyId) {
      payload.companyId = ownerDoc.companyId.toString();
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    // Set cookie and response
    const response = NextResponse.json(
      { message: "Login successful", token, role: ownerDoc.role },
      { status: 200 }
    );

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
