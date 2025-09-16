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

    // Check if a superAdmin with the given email already exists
    const existingAdmin = await Owner.findOne({ email, role: "superAdmin" });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "SuperAdmin already exists" },
        { status: 409 }
      );
    }

    // Create new superAdmin
    const superAdmin = await Owner.create({
      email,
      password,
      role: "superAdmin",
    });

    // Prepare token payload
    const payload: any = {
      userId: superAdmin._id.toString(),
      role: superAdmin.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    // Set cookie and response
    const response = NextResponse.json(
      {
        message: "SuperAdmin registered successfully",
        token,
        role: superAdmin.role,
      },
      { status: 201 }
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
    console.error("POST /api/auth/superadmin/register error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
