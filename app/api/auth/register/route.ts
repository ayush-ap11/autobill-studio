import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyName, gstin, email, phone, address, logoUrl, bankDetails } =
      body;

    // basic validation
    if (!companyName || !gstin || !email || !phone || !address) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: companyName, gstin, email, phone, address",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // check duplicates
    const existing = await Company.findOne({
      $or: [{ gstin }, { email }],
    }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "Company with same GSTIN or email already exists" },
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

    return NextResponse.json(
      {
        message: "Registration successful.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/auth/register error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
