import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  clerkId:   string;
  email:     string;
  firstName: string;
  lastName:  string;
  imageUrl:  string;
  createdAt: number;
}

const UserSchema = new Schema<IUser>({
  clerkId:   { type: String, required: true, unique: true },
  email:     { type: String, required: true },
  firstName: { type: String, default: "" },
  lastName:  { type: String, default: "" },
  imageUrl:  { type: String, default: "" },
  createdAt: { type: Number, default: () => Date.now() },
});

const UserModel: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
export default UserModel;
