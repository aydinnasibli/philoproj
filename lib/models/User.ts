import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  clerkId:   { type: String, required: true, unique: true, index: true },
  email:     { type: String, required: true },
  firstName: { type: String, default: "" },
  lastName:  { type: String, default: "" },
  imageUrl:  { type: String, default: "" },
  createdAt: { type: Number, default: () => Date.now() },
});

const UserModel = mongoose.models.User ?? mongoose.model("User", UserSchema);
export default UserModel;
