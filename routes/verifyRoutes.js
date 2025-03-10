import express from "express";
import { send_otp, verify_otp } from "../controllers/otpController.js";
const router = express.Router();



// verify/send-otp
router.get("/sendotpcheck",(req,res)=> {
    res.json({
        "msg" : "working"
    })
})
router.post("/sendotp", send_otp);
router.post("/otp", verify_otp);

export default router;
