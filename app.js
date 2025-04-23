import "./config/config.js"
import express, { urlencoded, json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";

import errorMiddleware from "./middleware/error.js";
import { isAuthenticated } from "./middleware/auth.js";
import { connectPassport } from "./utils/googleAuthProvider.js";
import { seedData } from "./utils/seeder.js";

import { scheduleCaseClosure } from "./utils/caseClosure.js";
import Counter from "./models/Counter.js";

const app = express();

// Initialize the counter at server startup
async function initialize() {
    await Counter.initializeCounter();
    console.log("Counter initialized.");
}

initialize().catch(console.error);


app.use(urlencoded({ extended: false }));
app.use(json());
app.use(cookieParser());
app.use(
    cors({
        origin: ["http://localhost:5173","http://localhost:5174"],
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
seedData()

app.get("/", (req, res) => {
    return res.json({ msg: "Done" }); // Fix: use res.json() to send a response
});




app.use("/api/v1/verify", verifyRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", isAuthenticated, userRoutes);
app.use("/api/v1/appointments", isAuthenticated, appointmentRoutes);
app.use("/api/v1/prescription", isAuthenticated, prescriptionRoutes);


//Error Handler
app.use(errorMiddleware);

// Schedule background jobs
scheduleCaseClosure();

export default app;
