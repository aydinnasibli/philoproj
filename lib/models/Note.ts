import mongoose, { Schema, type Document } from "mongoose";

export interface INote extends Document {
  clerkUserId: string;
  philosopherSlug: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    clerkUserId:     { type: String, required: true, index: true },
    philosopherSlug: { type: String, required: true },
    content:         { type: String, required: true },
  },
  { timestamps: true }
);

NoteSchema.index({ clerkUserId: 1, philosopherSlug: 1 });

export const Note = mongoose.models.Note ?? mongoose.model<INote>("Note", NoteSchema);
