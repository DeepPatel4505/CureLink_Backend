import "../config/config.js"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER,
        pass: process.env.APP_PASSWORD,
    },
});

// Function to generate a 6-digit OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP Email
export const sendOTPEmail = async(userEmail, otp)=> {
    const mailOptions = {
        from: process.env.USER,
        to: userEmail,
        subject: "Your OTP Code for Verification",
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("OTP sent to email:", userEmail);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
}

