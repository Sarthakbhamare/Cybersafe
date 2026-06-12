import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    demographic: { type: String, required: true },
    password: { type: String, required: true },
    xp: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: null },
    certification: {
    status: {
      type: String,
      enum: ["not_attempted", "certified", "expired", "max_attempts_reached"],
      default: "not_attempted",
    },
    isCertified: { type: Boolean, default: false },
    certificateId: { type: String, default: null },
    score: { type: Number, default: null },
    issuedAt: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    attempts: {
      type: [
        {
          attemptNumber: Number,
          date: Date,
          score: Number,
          passed: Boolean,
          timeTaken: Number,
        },
      ],
      default: [],
    },
      updatedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

userSchema.index({ xp: -1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model("User", userSchema);

export default User;
