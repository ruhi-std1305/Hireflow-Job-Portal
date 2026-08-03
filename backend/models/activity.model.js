import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    type:    { type: String, required: true },   // user | job | delete | flag | status
    icon:    { type: String, default: "🔔" },
    message: { type: String, required: true },
}, { timestamps: true });

export const Activity = mongoose.model("Activity", activitySchema);

// helper — অন্য কোনো controller থেকে সহজে activity log করার জন্য
export async function logActivity(type, icon, message) {
    try {
        await Activity.create({ type, icon, message });
        // সবসময় শুধু সর্বশেষ 100 টা log রাখা
        const count = await Activity.countDocuments();
        if (count > 100) {
            const extra = await Activity.find().sort({ createdAt: 1 }).limit(count - 100);
            await Activity.deleteMany({ _id: { $in: extra.map(e => e._id) } });
        }
    } catch (error) {
        console.log("logActivity error:", error);
    }
}
