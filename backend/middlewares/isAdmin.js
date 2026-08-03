import { User } from "../models/user.model.js";

// isAuthenticated এর পরে ব্যবহার করতে হবে — req.id থেকে user খুঁজে role চেক করে
export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(401).json({ message: "User not found", success: false });
        }
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only.", success: false });
        }
        if (user.suspended) {
            return res.status(403).json({ message: "Account suspended.", success: false });
        }
        req.adminUser = user;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
