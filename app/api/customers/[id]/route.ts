import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Customer } from "@/models/Customer";
import { getCompanyId } from "@/lib/auth";

// PUT: Update a customer for the company
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const companyId = getCompanyId(req);
  if (!companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: params.id, companyId },
      data,
      { new: true }
    );

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCustomer, { status: 200 });
  } catch (err) {
    console.error("Error updating customer:", err);
    return NextResponse.json(
      { error: "Error updating customer" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a customer for the company
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const companyId = getCompanyId(req);
  if (!companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deletedCustomer = await Customer.findOneAndDelete({
      _id: params.id,
      companyId,
    });

    if (!deletedCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Customer deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting customer:", err);
    return NextResponse.json(
      { error: "Error deleting customer" },
      { status: 500 }
    );
  }
}
