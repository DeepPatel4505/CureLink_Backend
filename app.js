import "./config/config.js"
import express, { urlencoded, json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";

import errorMiddleware from "./middleware/error.js";
import { isAuthenticated } from "./middleware/auth.js";
import { connectPassport } from "./utils/googleAuthProvider.js";

const app = express();



app.use(urlencoded({ extended: false }));
app.use(json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your_secret_key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 5,
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
connectPassport();

app.get("/", (req, res) => {
    return res.json({ msg: "Done" }); // Fix: use res.json() to send a response
});




app.use("/api/v1/verify", verifyRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", isAuthenticated, userRoutes);

//Error Handler
app.use(errorMiddleware);

export default app;
