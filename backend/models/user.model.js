import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    
    role: {
        type: String,
        enum: ['seeker', 'employer', 'admin'],
        required: true
    },
    suspended: {
        type: Boolean,
        default: false
    },
    
    companyName: {
        type: String,
        default: ""
    },
    profile: {
        bio: { type: String },
        title: { type: String, default: "" },
        location: { type: String, default: "" },
        skills: [{ type: String }],
        resume: { type: String },
        resumeOriginalName: { type: String },
        company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
        profilePhoto: {
            type: String,
            default: ""
        }
    }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);