import mongoose, { Schema, Document } from "mongoose";

export interface ProductDoc extends Document {
  name: string;
  hsnSac: string;
  defaultRate: number;
  gstPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<ProductDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    hsnSac: { type: String, default: "", trim: true, maxlength: 20 },
    defaultRate: { type: Number, default: 0, min: 0 },
    gstPercentage: { type: Number, default: 18, min: 0, max: 100 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 1 });

export const Product =
  (mongoose.models.Product as mongoose.Model<ProductDoc>) ||
  mongoose.model<ProductDoc>("Product", ProductSchema);
