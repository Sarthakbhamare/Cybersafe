import mongoose from "mongoose";

const StorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  textRedacted: { type: String, required: true },
  textOriginal: { type: String, required: true, select: false },
  tags: { type: [String], default: [] },
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
  // Map of userId -> reaction type
  reactionsByUser: { type: Map, of: String, default: {} },
  shares: {
    whatsapp: { type: Number, default: 0 },
    telegram: { type: Number, default: 0 },
    instagram: { type: Number, default: 0 },
    copy: { type: Number, default: 0 }
  }
});

StorySchema.index({ userId: 1, createdAt: -1 });
StorySchema.index({ createdAt: -1 });

const Story = mongoose.model("Story", StorySchema);

export default Story;
