import mongoose, { Document, Schema } from "mongoose";

export interface IRateLimit extends Document {
  key: string;
  count: number;
  windowStart: Date;
}

const schema = new Schema<IRateLimit>(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 0 },
    windowStart: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

// Auto-delete documents 120s after their window starts (windows are 60s)
schema.index({ windowStart: 1 }, { expireAfterSeconds: 120 });

const RateLimitModel =
  (mongoose.models.RateLimit as mongoose.Model<IRateLimit>) ??
  mongoose.model<IRateLimit>("RateLimit", schema);

export default RateLimitModel;
