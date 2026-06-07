const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  first: { type: String, required: true },
  last: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String },
  role: {
    type: String,
    enum: ["seeker", "employer", "admin"],
    default: "seeker"
  },
  suspended: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);