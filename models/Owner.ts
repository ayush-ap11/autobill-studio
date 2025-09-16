import bcrypt from "bcryptjs";
import mongoose, { Document, model, mongo, Schema, Types } from "mongoose";

export interface IOwner extends Document {
  _id: Types.ObjectId;
  companyId?: Types.ObjectId;
  name?: string;
  email: string;
  password?: string;
  googleId?: string;
  role: "superAdmin" | "owner";
}

const OwnerSchema = new Schema<IOwner>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    role: {
      type: String,
      enum: ["superAdmin", "owner"],
      default: "owner",
    },
  },
  { timestamps: true }
);

// Pre-hook: hash password if modified
OwnerSchema.pre<IOwner>("save", async function (next) {
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Instance method: compare passwords
OwnerSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IOwner>("User", OwnerSchema);
