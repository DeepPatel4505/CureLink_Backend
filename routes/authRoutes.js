import "../config/config.js"
import express from "express";
import {
    register,
    login,
    logout,
    googleCallback,
} from "../controllers/authController.js";
import passport from "passport";
const router = express.Router();

//jwt authentication
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

//google authentication
router.get(
    "/googleauth",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        successRedirect: process.env.FRONTEND_URI,
    }),
    googleCallback
);

export default router;
