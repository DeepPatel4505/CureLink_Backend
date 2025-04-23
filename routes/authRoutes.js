import "../config/config.js";
import express from "express";
import {
    register,
    login,
    logout,
    googleCallback,
} from "../controllers/authController.js";
import passport from "passport";
import { isAuthenticated } from "../middleware/auth.js";
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
    }),
    googleCallback
);

router.get("/verify-me", isAuthenticated, (req, res) => {
    // console.log("Res sent");
    // console.log(req.user);
    
    res.status(200).json({
        authenticated: true,
        user: req.user,
    });
});


export default router;
