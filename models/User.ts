import bcrypt from "bcryptjs";
import mongoose, { Document, model, mongo, Schema, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  companyId?: Types.ObjectId;
  name?: string;
  email: string;
  password?: string;
  googleId?: string;
  role: "superAdmin" | "admin" | "user";
}

const UserSchema = new Schema<IUser>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    role: {
      type: String,
      enum: ["superAdmin", "admin", "user"],
      default: "admin",
    },
  },
  { timestamps: true }
);

// Pre-hook: hash password if modified
UserSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Instance method: compare passwords
UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>("User", UserSchema);
