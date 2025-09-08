import bcrypt from "bcryptjs";
import mongoose, { Document, model, mongo, Schema, Types } from "mongoose";

export interface ICustomer extends Document {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    gstin: { type: String },
  },
  { timestamps: true }
);

export const Customer = model<ICustomer>("Customer", CustomerSchema);
