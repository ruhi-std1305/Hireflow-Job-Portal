import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false
            });
        }

        // 🔥 Bearer remove করা
        const token = authHeader.split(" ")[1];

        const decode = jwt.verify(token, process.env.SECRET_KEY);

        req.id = decode.userId;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid token",
            success: false
        });
    }
};