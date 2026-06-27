import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
      trim: true,
    },
    fileUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
