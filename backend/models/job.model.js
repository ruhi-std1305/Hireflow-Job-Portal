import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title:           { type: String,  required: true },
    description:     { type: String,  required: true },
    requirements:    [{ type: String }],
    salary:          { type: String,  default: "" },         // String — "৳60,000–৳90,000"
    location:        { type: String,  required: true },
    jobType:         { type: String,  required: true },
    category:        { type: String,  default: "Technology" },
    experienceLevel: { type: Number,  default: 0 },
    position:        { type: Number,  default: 1 },
    skills:          [{ type: String }],
    deadline:        { type: String,  default: "" },
    status:          { type: String,  enum: ["open","closed"], default: "open" },
    flagged:         { type: Boolean, default: false },
    flagReason:      { type: String,  default: "" },
    company:         { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    created_by:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    applications:    [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }]
}, { timestamps: true });

export const Job = mongoose.model("Job", jobSchema);
