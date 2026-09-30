import mongoose, { Schema } from "mongoose";

export interface CounterAttrs {
  _id: string;
  sequence: number;
}

const CounterSchema = new Schema<CounterAttrs>(
  {
    _id: { type: String, required: true },
    sequence: { type: Number, required: true, default: 0 },
  },
  { versionKey: false }
);

export const Counter =
  (mongoose.models.Counter as mongoose.Model<CounterAttrs>) ||
  mongoose.model<CounterAttrs>("Counter", CounterSchema);
