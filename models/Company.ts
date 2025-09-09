import bcrypt from "bcryptjs";
import mongoose, { Document, mongo, Schema, Types } from "mongoose";

export interface ICompany extends Document {
  name: string;
  _id: Types.ObjectId;
  gstin: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string; // ✅ logo image
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    branch?: string;
    upiId?: string;
  };
  status: "rejected" | "approved" | "pending";
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    gstin: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    logoUrl: { type: String },
    bankDetails: {
      accountNumber: { type: String },
      ifsc: { type: String },
      bankName: { type: String },
      branch: { type: String },
      upiId: { type: String },
    },
    status: {
      type: String,
      enum: ["rejected", "approved", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Company =
  (mongoose.models.Company as mongoose.Model<ICompany>) ||
  mongoose.model<ICompany>("Company", CompanySchema);

export default Company;
