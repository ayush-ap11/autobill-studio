import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import { getCompanyId } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { customerId, goods, gstPercent } = body;
    if (
      !customerId ||
      !Array.isArray(goods) ||
      goods.length === 0 ||
      typeof gstPercent !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    for (const g of goods) {
      if (!mongoose.Types.ObjectId.isValid(g.id)) {
        return NextResponse.json(
          { error: `Invalid goods ID: ${g.id}` },
          { status: 400 }
        );
      }
    }

    // Fetch goods/items from database and validate they belong to the company
    const { Items } = await import("@/models/Item");
    const goodsIds = goods.map((g: any) => new mongoose.Types.ObjectId(g.id));
    const fetchedGoods = await Items.find({
      _id: { $in: goodsIds },
      companyId: new mongoose.Types.ObjectId(companyId),
    });

    if (fetchedGoods.length !== goods.length) {
      return NextResponse.json(
        { error: "Some goods/items not found or don't belong to your company" },
        { status: 400 }
      );
    }

    // Process items and compute totals
    const processedItems = goods.map((g: any) => {
      const goodItem = fetchedGoods.find(
        (fg) => fg._id.toString() === g.id.toString()
      );
      if (!goodItem) throw new Error("Item mismatch");
      const unitPrice = goodItem.rate;
      const total = g.qty * unitPrice;
      return {
        itemId: goodItem._id,
        quantity: g.qty,
        unitPrice,
        total,
      };
    });

    const subtotal = processedItems.reduce((sum, itm) => sum + itm.total, 0);
    const cgst = gstPercent / 2;
    const sgst = gstPercent / 2;
    const taxAmount = Number(((subtotal * gstPercent) / 100).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));

    // Generate next invoiceNo (sequential per company)
    const lastInvoice = await Invoice.findOne({ companyId })
      .sort({ createdAt: -1 })
      .select("invoiceNo")
      .lean();

    let nextInvoiceNo = 1;
    if (lastInvoice && lastInvoice.invoiceNo) {
      // If invoiceNo is numeric, increment; else fallback to timestamp
      const parsed = parseInt(lastInvoice.invoiceNo, 10);
      if (!isNaN(parsed)) {
        nextInvoiceNo = parsed + 1;
      } else {
        nextInvoiceNo = Date.now();
      }
    }

    const invoice = await Invoice.create({
      companyId,
      customerId,
      invoiceNo: nextInvoiceNo.toString(),
      items: processedItems,
      cgst,
      sgst,
      subtotal,
      taxAmount,
      totalAmount,
    });

    return NextResponse.json(
      {
        message: "Invoice created successfully.",
        invoiceId: invoice._id,
      },
      { status: 201 }
    );
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
    const invoices = await Invoice.find({ companyId })
      .populate("customerId", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Transform response to match API spec
    const response = invoices.map((inv: any) => ({
      _id: inv._id,
      customerName: inv.customerId?.name || "Unknown",
      totalAmount: inv.totalAmount,
      date: inv.invoiceDate,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
