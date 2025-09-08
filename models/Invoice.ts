import mongoose, { Document, Schema, model, Types } from "mongoose";

// 1. Invoice Item Sub-Interface
export interface IInvoiceItem {
  itemId: Types.ObjectId; // reference to Items
  quantity: number; // qty of item
  unitPrice: number; // per unit price
  total: number; // total for this item = qty * price
}

// 2. Invoice Interface
export interface IInvoice extends Document {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  customerId: Types.ObjectId;
  invoiceNo: string;
  invoiceDate: Date;
  items: IInvoiceItem[];
  cgst: number; // Central GST %
  sgst: number; // State GST %
  subtotal: number; // total before taxes
  taxAmount: number; // total tax (cgst+sgst applied)
  totalAmount: number; // subtotal + tax
  status: "draft" | "sent" | "paid";
  pdfUrl?: string; // optional: store generated PDF URL
  signUrl?: string; // optional: uploaded e-sign/signature file
  paymentQrUrl?: string;
}

// 3. Schema
const InvoiceSchema = new Schema<IInvoice>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    invoiceNo: { type: String, required: true },
    invoiceDate: { type: Date, default: Date.now },
    items: [
      {
        itemId: { type: Schema.Types.ObjectId, ref: "Items", required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],

    cgst: { type: Number, required: true },
    sgst: { type: Number, required: true },

    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    status: { type: String, enum: ["draft", "sent", "paid"], default: "draft" },

    pdfUrl: { type: String },
    signUrl: { type: String }, // uploaded e-sign / signature file
    paymentQrUrl: { type: String },
  },
  { timestamps: true }
);

// ✅ Pre-save hook: Auto-generate invoiceNo if not provided
InvoiceSchema.pre<IInvoice>("save", async function (next) {
  if (!this.invoiceNo) {
    const company = await mongoose.model("Company").findById(this.companyId);
    if (company) {
      // Example: Use company initials + timestamp
      const prefix = company.name.substring(0, 3).toUpperCase();
      this.invoiceNo = `${prefix}/${Date.now()}`;
    }
  }
  next();
});

// 4. Model
export const Invoice = model<IInvoice>("Invoice", InvoiceSchema);
