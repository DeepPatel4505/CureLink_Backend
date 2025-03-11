import express from "express";
import {
    bookAppointment,
    approveAppointment,
    rejectAppointment,
    updateAppointment,
    todaysAppointment
} from "../controllers/appointmentController.js";

const router = express.Router();

// Routes
router.post("/book", bookAppointment);
router.post("/approve", approveAppointment);
router.post("/reject", rejectAppointment);
router.post("/update", updateAppointment);
router.post("/today", todaysAppointment);

export default router;
