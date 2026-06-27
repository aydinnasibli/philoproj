import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

export interface IConversation extends Document {
  userId: string;
  philosopherSlug: string;
  philosopherName: string;
  messages: IMessage[];
  createdAt: number;
  updatedAt: number;
}

const MessageSchema = new Schema<IMessage>(
  {
    role:      { type: String, required: true, enum: ["user", "assistant", "system"] },
    content:   { type: String, required: true },
    createdAt: { type: Number, required: true },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    userId:          { type: String, required: true, index: true },
    philosopherSlug: { type: String, required: true },
    philosopherName: { type: String, required: true },
    messages:        { type: [MessageSchema], default: [] },
    createdAt:       { type: Number, default: () => Date.now() },
    updatedAt:       { type: Number, default: () => Date.now() },
  },
  { timestamps: false }
);

ConversationSchema.index({ userId: 1, updatedAt: -1 });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ?? mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
