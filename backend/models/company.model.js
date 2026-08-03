import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name:        { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    website:     { type: String, default: "" },
    location:    { type: String, default: "" },
    logo:        { type: String, default: "" },
    industry:    { type: String, default: "" },    // ← নতুন
    initials:    { type: String, default: "" },    // ← নতুন
    color:       { type: String, default: "#1A5CFF" }, // ← নতুন
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export const Company = mongoose.model("Company", companySchema);
