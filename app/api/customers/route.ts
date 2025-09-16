import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Customer } from "@/models/Customer";
import { getCompanyId } from "@/lib/auth";

// POST: Create a new customer scoped to the company
export async function POST(req: NextRequest) {
  await dbConnect();

  const companyId = getCompanyId(req);
  if (!companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { name, email, phone, address, gstin } = data;

    // ✅ Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // (Optional) add further validations
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "Phone must be 10 digits" },
        { status: 400 }
      );
    }

    // Save customer
    const customer = await Customer.create({
      companyId,
      name,
      email,
      phone,
      address,
      gstin,
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (err) {
    console.error("Error creating customer:", err);
    return NextResponse.json(
      { error: "Error creating customer" },
      { status: 500 }
    );
  }
}

// GET: Retrieve all customers for the company
export async function GET(req: NextRequest) {
  await dbConnect();

  const companyId = getCompanyId(req);
  if (!companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const customers = await Customer.find({ companyId });
    return NextResponse.json(customers, { status: 200 });
  } catch (err) {
    console.error("Error fetching customers:", err);
    return NextResponse.json(
      { error: "Error fetching customers" },
      { status: 500 }
    );
  }
}
