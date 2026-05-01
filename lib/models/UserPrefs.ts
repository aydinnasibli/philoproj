import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUserPrefs extends Document {
  userId: string;
  sort: string;
  flatCards: boolean;
  wcGoal: number;
  customTags: { name: string; color: string }[];
}

const UserPrefsSchema = new Schema<IUserPrefs>(
  {
    userId:     { type: String, required: true, unique: true },
    sort:       { type: String, default: "newest" },
    flatCards:  { type: Boolean, default: false },
    wcGoal:     { type: Number, default: 200 },
    customTags: { type: [{ name: String, color: String }], default: [] },
  },
  { timestamps: false }
);

const UserPrefs: Model<IUserPrefs> =
  mongoose.models.UserPrefs ?? mongoose.model<IUserPrefs>("UserPrefs", UserPrefsSchema);

export default UserPrefs;
