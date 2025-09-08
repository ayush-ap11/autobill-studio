import bcrypt from "bcryptjs";
import mongoose, { Document, model, mongo, Schema, Types } from "mongoose";

export interface IItem extends Document {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  name: string;
  hsn: string;
  rate: number;
}

const ItemsSchema = new Schema<IItem>({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  name: { type: String, required: true },
  hsn: { type: String },
  rate: { type: Number, required: true },
}, { timestamps: true });

export const Items = model<IItem>("Items", ItemsSchema);
