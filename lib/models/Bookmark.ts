import mongoose, { Schema, type Document } from "mongoose";

export interface IBookmark extends Document {
  clerkUserId: string;
  type: "philosopher" | "school";
  slug: string;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    clerkUserId: { type: String, required: true, index: true },
    type:        { type: String, required: true, enum: ["philosopher", "school"] },
    slug:        { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

BookmarkSchema.index({ clerkUserId: 1, type: 1, slug: 1 }, { unique: true });

export const Bookmark = mongoose.models.Bookmark ?? mongoose.model<IBookmark>("Bookmark", BookmarkSchema);
