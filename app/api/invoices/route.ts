import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import { getCompanyId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { customerId, items, cgst, sgst } = body;
    if (
      !customerId ||
      !Array.isArray(items) ||
      typeof cgst !== "number" ||
      typeof sgst !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }
    // Process items and compute totals
    const processedItems = items.map((itm: any) => {
      const { itemId, quantity, unitPrice } = itm;
      const total = quantity * unitPrice;
      return { itemId, quantity, unitPrice, total };
    });
    const subtotal = processedItems.reduce((sum, itm) => sum + itm.total, 0);
    const taxAmount = Number(((subtotal * (cgst + sgst)) / 100).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));

    await dbConnect();
    const invoice = await Invoice.create({
      companyId,
      customerId,
      items: processedItems,
      cgst,
      sgst,
      subtotal,
      taxAmount,
      totalAmount,
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("POST /api/invoices error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const invoices = await Invoice.find({ companyId }).sort({ createdAt: -1 });
    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
