import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    profilePic: {
      type: String,
      default: "",
    },
    FullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

// Explicit unique index helps query performance and duplicate prevention.
userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model("User", userSchema);
