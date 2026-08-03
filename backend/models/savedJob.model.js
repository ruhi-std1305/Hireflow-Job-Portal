import mongoose from "mongoose";

const savedJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
  },
  { timestamps: true }
);

// একই user একই job দুইবার save করতে পারবে না
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

export const SavedJob = mongoose.model("SavedJob", savedJobSchema);