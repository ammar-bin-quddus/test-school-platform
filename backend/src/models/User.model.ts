import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: "student" | "admin" | "supervisor";
  isVerified: boolean;
  otpCode?: string;
  otpExpiry?: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin", "supervisor"], default: "student" },
    isVerified: { type: Boolean, default: false },
    otpCode: { type: String },
    otpExpiry: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
