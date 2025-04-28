import "../config/config.js";
import bcrypt from "bcrypt";
import { Patient } from "../models/Patient.js";
import User from "../models/User.js";
import { sendCookie, destroyCookie } from "../utils/cookie.js";
import Errorhandler from "../utils/errorhandler.js";
import respond from "../utils/jsonresponse.js";
import { sendOTPEmail, generateOTP } from "../utils/otphandler.js";
import {sendResetLinkEmail} from "../utils/emailHandler.js"
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
        let user = await Patient.findOne({ email });
        if (user) return next(new Errorhandler("User already exists", 400));

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new Patient({ username, email, password: hashedPassword });
        await user.save();

        const token = sendCookie(user, res);
        respond(res, 200, "Registered successfully", token);
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new Errorhandler("Email and password are required.", 400));
    }
    try {
        let user = await User.findOne({ email }).select("+password");
        if (!user) return next(new Errorhandler("User not found.", 404));

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return next(new Errorhandler("Invalid password", 400));

        const token = sendCookie(user, res);
        const role = user.role;
        respond(res, 200, "Logged In successfully", { token, role });
    } catch (err) {
        next(err);
    }
};

export const logout = async (req, res, next) => {
    try {
        destroyCookie(res);
        respond(res, 200, "Logged Out successfully");
    } catch (error) {
        next(error);
    }
};

export const googleCallback = (req, res) => {
    const user = req.user;
    sendCookie(user, res);
    res.redirect(`${process.env.FRONTEND_URI}/login-success`);
};

// Forgot Password Endpoint
export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    
    if (!email) {
        return next(new Errorhandler("Email is required", 400));
    }
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return next(new Errorhandler("User not found", 404));
        }
        
        // Generate a reset token
        const resetToken = sendCookie(user._id,res);
        
        // Construct the reset link
        const resetLink = `${process.env.FRONTEND_URI}/reset-password/${resetToken}`;
        
        // Send the reset link via email
        await sendResetLinkEmail(email, resetLink);
        
        respond(res, 200, "Reset link sent to email");
    } catch (error) {
        next(new Errorhandler("Error sending reset link", 500));
    }
};

// Reset Password Endpoint
export const resetPassword = async (req, res, next) => {
    const { token, password } = req.body;
    
    if (!token || !password) {
        return next(new Errorhandler("Token and password are required", 400));
    }
    
    try {
        // Verify the reset token
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        console.log(123);
        console.log(decoded);
        const user = await User.findById(decoded._id);
        
        if (!user) {
            return next(new Errorhandler("User not found", 404));
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        respond(res, 200, "Password reset successfully");
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new Errorhandler("Token has expired", 400));
        }
        next(new Errorhandler("Error resetting password", 500));
    }
};
