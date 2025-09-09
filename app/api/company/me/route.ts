import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import jwt from "jsonwebtoken";
import { getCompanyId } from "@/lib/auth";

const JWT_SECRET = process.env.JWT_SECRET || "";

// GET /api/company/me - get current company details
export async function GET(req: Request) {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const company = await Company.findById(companyId).lean();
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company }, { status: 200 });
  } catch (err) {
    console.error("GET /api/company/me error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/company/me - update company details
export async function PUT(req: Request) {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const allowed = [
      "name",
      "phone",
      "address",
      "logoUrl",
      "bankDetails",
      "gstin",
      "email",
    ];
    const updates: Record<string, any> = {};
    for (const key of Object.keys(body)) {
      if (allowed.includes(key)) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    await dbConnect();
    const updated = await Company.findOneAndUpdate(
      { _id: companyId },
      { $set: updates },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company: updated }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/company/me error:", err);
    if (err?.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate value for gstin/email" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
