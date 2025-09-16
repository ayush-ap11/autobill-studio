import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Items } from "@/models/Item";
import { getCompanyId } from "@/lib/auth";

// POST: Create a new good/service (item) for the company
export async function POST(req: NextRequest) {
  await dbConnect();

  const companyId = getCompanyId(req);
  if (!companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { name, hsn, rate } = data;

    // Validate the input data
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing name" },
        { status: 400 }
      );
    }

    if (rate === undefined || typeof rate !== "number" || rate < 0) {
      return NextResponse.json(
        { error: "Invalid or missing rate" },
        { status: 400 }
      );
    }

    // Create a sanitized item object with only allowed fields
    const itemData = { name, hsn: hsn ? hsn : "", rate, companyId };

    const item = await Items.create(itemData);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("Error creating item:", err);
    return NextResponse.json({ error: "Error creating item" }, { status: 500 });
  }
}

// GET: Retrieve all goods/services (items) for the company
export async function GET(req: NextRequest) {
  await dbConnect();

  const companyId = getCompanyId(req);
  if (!companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await Items.find({ companyId });
    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("Error fetching items:", err);
    return NextResponse.json(
      { error: "Error fetching items" },
      { status: 500 }
    );
  }
}
