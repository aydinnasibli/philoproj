import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMarginalium {
  _id: string;
  text: string;
  createdAt: number;
}

export interface INote extends Document {
  userId: string;
  title: string;
  body: string;
  tags: string[];
  links: string[];
  marginalia: IMarginalium[];
  pinned: boolean;
  wordCount: number;
  createdAt: number;
  updatedAt: number;
}

const MarginaliumSchema = new Schema<IMarginalium>(
  {
    _id: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Number, required: true },
  },
  { _id: false }
);

const NoteSchema = new Schema<INote>(
  {
    userId:     { type: String, required: true, index: true },
    title:      { type: String, default: "" },
    body:       { type: String, default: "" },
    tags:       { type: [String], default: [] },
    links:      { type: [String], default: [] },
    marginalia: { type: [MarginaliumSchema], default: [] },
    pinned:     { type: Boolean, default: false },
    wordCount:  { type: Number },
    createdAt:  { type: Number, default: () => Date.now() },
    updatedAt:  { type: Number, default: () => Date.now() },
  },
  { timestamps: false }
);

NoteSchema.index({ userId: 1, _id: -1 });
NoteSchema.index({ userId: 1, wordCount: -1, _id: -1 });
NoteSchema.index({ userId: 1, title: 1, _id: 1 });

const Note: Model<INote> =
  mongoose.models.Note ?? mongoose.model<INote>("Note", NoteSchema);

export default Note;
