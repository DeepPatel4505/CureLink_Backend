import "../config/config.js"
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Login first.",
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userdata = await User.findOne({ _id: decoded._id });
        if (!userdata) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found",
            });
        }
        req.user = userdata;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid token",
        });
    }
};

