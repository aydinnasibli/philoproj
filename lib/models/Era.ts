import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEra extends Document {
  title: string;
  slug: string;
  startYear: number;
  endYear: number;
  description: string;
}

const EraSchema = new Schema<IEra>(
  {
    title:       { type: String, required: true },
    slug:        { type: String, required: true, unique: true },
    startYear:   { type: Number, required: true },
    endYear:     { type: Number, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const Era: Model<IEra> =
  mongoose.models.Era ?? mongoose.model<IEra>("Era", EraSchema);

export default Era;
