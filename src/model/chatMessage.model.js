import { model, Schema } from "mongoose";

const chatMessageSchema = new Schema(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["candidate", "interviewer"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

const ChatMessageModel = model("ChatMessage", chatMessageSchema);
export default ChatMessageModel;