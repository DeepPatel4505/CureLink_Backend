import "../config/config.js"
import bcrypt from "bcrypt";
import { Patient } from "../models/Patient.js";
import User from "../models/User.js";
import { sendCookie, destroyCookie } from "../utils/cookie.js";
import Errorhandler from "../utils/errorhandler.js";
import respond from "../utils/jsonresponse.js";

export const register = async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
        //finding user
        let user = await Patient.findOne({ email });
        if (user) return next(new Errorhandler("User already exists", 400)); //means user exist while sign up

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with hashed password
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
        respond(res, 200, "Logged In successfully", {token,role});
    } catch (err) {
        next(err);
    }
};

export const logout = async (req, res, next) => {
    try {
        destroyCookie(res);
        respond(res, 200, "logged Out successfully");
    } catch (error) {
        next(error);
    }
};

export const googleCallback = (req, res) => {
    const user = req.user;
    console.log("Hyy")
    sendCookie(user,res)
    res.redirect(`${process.env.FRONTEND_URI}/profile`);
};
