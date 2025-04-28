import express from "express";
import { send_otp, verify_otp } from "../controllers/otpController.js";
const router = express.Router();
import User from "../models/User.js";
import dns from "dns";
import { promisify } from "util";
import { sendContactFormEmail } from "../utils/emailHandler.js";

// verify/send-otp
router.get("/sendotpcheck", (req, res) => {
    res.json({
        msg: "working",
    });
});
router.post("/sendotp", send_otp);
router.post("/checkotp", verify_otp);

router.post("/check-email", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const user = await User.findOne({ email: email });

        if (user) {
            return res
                .status(200)
                .json({ exists: true, message: "Email already exists." });
        } else {
            return res
                .status(200)
                .json({ exists: false, message: "Email is available." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error." });
    }
});

router.post("/validate-email", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Basic format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
                isValid: false,
            });
        }

        // Extract domain from email
        const domain = email.split("@")[1];

        try {
            // Check if domain has MX records
            const mxRecords = await resolveMxPromise(domain);

            if (!mxRecords || mxRecords.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "This email domain cannot receive emails",
                    isValid: false,
                });
            }

            return res.status(200).json({
                success: true,
                message: "Email domain is valid",
                isValid: true,
            });
        } catch (dnsError) {
            return res.status(400).json({
                success: false,
                message: "Email domain appears to be invalid",
                isValid: false,
            });
        }
    } catch (error) {
        console.error("Error validating email:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while validating email",
            isValid: false,
        });
    }
});


// Route: POST /api/contact
router.post("/contact", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Basic validation
        if (!name || !email || !subject || !message) {
            return res
                .status(400)
                .json({ message: "All fields are required." });
        }

        // (Optional) You could add more validations here (like email format check)

        // (Optional) Save to database or send an email here
        sendContactFormEmail(name,email,subject,message);

        // Respond with success
        res.status(200).json({ message: "Message received successfully!" });
    } catch (error) {
        console.error("Error receiving contact form:", error);
        res.status(500).json({
            message: "An error occurred while submitting the form.",
        });
    }
});



export default router;
