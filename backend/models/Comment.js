import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story",
    required: true,
  },
  textRedacted: { type: String, required: true },
  textOriginal: { type: String, required: true, select: false },
  createdAt: { type: Date, default: Date.now },
  upvotes: { type: Number, default: 0 },
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 },
    wow: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
  },
  reactionsByUser: { type: Map, of: String, default: {} },
});

CommentSchema.index({ storyId: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", CommentSchema);

export default Comment;
