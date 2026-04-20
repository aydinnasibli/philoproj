import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IImportantWork {
  title: string;
  year: number;
  synopsis: string;
}

export interface IPhilosopher extends Document {
  name: string;
  slug: string;
  era: Types.ObjectId;
  birthYear: number;
  deathYear: number;
  hookQuote: string;
  coreBranch: string;
  shortSummary: string;
  fullBiography: string;
  importantWorks: IImportantWork[];
  keyTakeaways: string[];
  mentors: Types.ObjectId[];
  students: Types.ObjectId[];
  avatarUrl: string;
  networkX: number; // 0-100 normalised X position for graph
  networkY: number; // 0-100 normalised Y position for graph
}

const ImportantWorkSchema = new Schema<IImportantWork>(
  {
    title:    { type: String, required: true },
    year:     { type: Number },
    synopsis: { type: String, default: "" },
  },
  { _id: false }
);

const PhilosopherSchema = new Schema<IPhilosopher>(
  {
    name:          { type: String, required: true },
    slug:          { type: String, required: true, unique: true },
    era:           { type: Schema.Types.ObjectId, ref: "Era" },
    birthYear:     { type: Number },
    deathYear:     { type: Number },
    hookQuote:     { type: String, default: "" },
    coreBranch:    { type: String, default: "" },
    shortSummary:  { type: String, default: "" },
    fullBiography: { type: String, default: "" },
    importantWorks: { type: [ImportantWorkSchema], default: [] },
    keyTakeaways:   { type: [String], default: [] },
    mentors:        [{ type: Schema.Types.ObjectId, ref: "Philosopher" }],
    students:       [{ type: Schema.Types.ObjectId, ref: "Philosopher" }],
    avatarUrl:      { type: String, default: "" },
    networkX:       { type: Number, default: 50 },
    networkY:       { type: Number, default: 50 },
  },
  { timestamps: true }
);

// Text index for future search capability
PhilosopherSchema.index({ name: "text", coreBranch: "text" });

const Philosopher: Model<IPhilosopher> =
  mongoose.models.Philosopher ??
  mongoose.model<IPhilosopher>("Philosopher", PhilosopherSchema);

export default Philosopher;
