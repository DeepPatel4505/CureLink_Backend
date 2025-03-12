import "../config/config.js"
import Errorhandler from "../utils/errorhandler.js";
import respond from "../utils/jsonresponse.js";
import { sendOTPEmail, generateOTP } from "../utils/otphandler.js";
export const send_otp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const otp = generateOTP();
    req.session.otp = otp; // Store OTP in session
    console.log("send-otp", req.session.otp);

    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent to email" });
};

export const verify_otp = (req, res, next) => {
    const { otp } = req.body;

    if (!otp) return res.status(400).json({ error: "OTP is required!" });

    if (parseInt(otp) === parseInt(req.session.otp)) {
        req.session.otp = null; // Clear OTP after successful verification
        // return res.json({ message: "OTP verified successfully!" });
        return respond(res,200,"OTP verified successfully")
    } else {
        // return res.status(400).json({ error: "Invalid OTP!" });
        next(new Errorhandler("Invalid OTP",400))
    }
};
