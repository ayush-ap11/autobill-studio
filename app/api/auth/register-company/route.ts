import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import { Owner } from "@/models/Owner";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyName,
      gstin,
      email,
      phone,
      address,
      password,
      logoUrl,
      bankDetails,
    } = body;

    // basic validation
    if (!companyName || !gstin || !email || !phone || !address || !password) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: companyName, gstin, email, phone, address, password",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // check duplicates for company
    const existing = await Company.findOne({
      $or: [{ gstin }, { email }],
    }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "Company with same GSTIN or email already exists" },
        { status: 409 }
      );
    }

    // check if owner with same email exists
    const existingOwner = await Owner.findOne({ email }).lean();
    if (existingOwner) {
      return NextResponse.json(
        { error: "User with same email already exists" },
        { status: 409 }
      );
    }

    // create company (no approval required)
    const company = await Company.create({
      name: companyName,
      gstin,
      email,
      phone,
      address,
      logoUrl: logoUrl || undefined,
      bankDetails: bankDetails || undefined,
      status: "approved",
    });

    // create owner record with password
    const owner = await Owner.create({
      companyId: company._id,
      email,
      password,
      role: "owner",
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: owner._id.toString(),
        companyId: company._id.toString(),
        role: "owner",
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set cookie and response
    const response = NextResponse.json(
      {
        message: "Registration successful.",
        companyId: company._id,
        token,
        role: "owner",
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
    console.error("POST /api/auth/register error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
