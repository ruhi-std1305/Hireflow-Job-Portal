import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.log("MongoDB connection error:", error);
        process.exit(1); // কানেকশন না হলে সার্ভার বন্ধ করে দেবে
    }
}

export default connectDB;