import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import { getCompanyId } from "@/lib/auth";
// @ts-ignore: missing type declarations for pdfkit
import PDFDocument from "pdfkit";

interface Params {
  id: string;
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const invoice = await Invoice.findOne({ _id: id, companyId }).lean();
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Generate PDF in-memory
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers: Uint8Array[] = [];
      doc.on("data", (chunk: any) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Header
      doc
        .fontSize(20)
        .text(`Invoice: ${invoice.invoiceNo}`, { align: "center" });
      doc.moveDown();

      // Invoice details
      doc.fontSize(12);
      doc.text(
        `Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`
      );
      doc.text(`Status: ${invoice.status}`);
      doc.moveDown();

      // Items table
      doc.text("Items:", { underline: true });
      invoice.items.forEach((item: any) => {
        doc.text(
          `• Item ID: ${item.itemId.toString()} | Qty: ${
            item.quantity
          } | Unit Price: ₹${item.unitPrice.toFixed(
            2
          )} | Total: ₹${item.total.toFixed(2)}`
        );
      });
      doc.moveDown();

      // Totals
      doc.text(`Subtotal: ₹${invoice.subtotal.toFixed(2)}`);
      doc.text(
        `Tax (${invoice.cgst}% + ${
          invoice.sgst
        }%): ₹${invoice.taxAmount.toFixed(2)}`
      );
      doc.text(`Total Amount: ₹${invoice.totalAmount.toFixed(2)}`);

      doc.end();
    });

    // Convert Buffer to Uint8Array for response
    const pdfUint8 = new Uint8Array(pdfBuffer);
    return new NextResponse(pdfUint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNo}.pdf"`,
      },
    });
  } catch (error) {
    console.error(`GET /api/invoices/${params.id}/pdf error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
