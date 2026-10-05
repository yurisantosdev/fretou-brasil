import mongoose from "mongoose";

type CounterType = {
  _id: string;
  sequence: number;
};

const counterSchema = new mongoose.Schema<CounterType>(
  {
    _id: { type: String, required: true },
    sequence: { type: Number, required: true },
  },
  { collection: "counters", versionKey: false },
);

export const Counter =
  (mongoose.models.Counter as mongoose.Model<CounterType> | undefined) ??
  mongoose.model<CounterType>("Counter", counterSchema);
