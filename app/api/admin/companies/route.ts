import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import { getTokenPayload } from "@/lib/auth";

// GET: Retrieve all companies (for Super Admin)
export async function GET(req: NextRequest) {
  await dbConnect();
  const payload = getTokenPayload(req);
  if (!payload || payload.role !== "superAdmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const companies = await Company.find({});
    return NextResponse.json(companies, { status: 200 });
  } catch (err) {
    console.error("Error fetching companies:", err);
    return NextResponse.json(
      { error: "Error fetching companies" },
      { status: 500 }
    );
  }
}
