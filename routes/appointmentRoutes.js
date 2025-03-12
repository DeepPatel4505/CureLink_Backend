import express from "express";
import {
    bookAppointment,
    approveAppointment,
    rejectAppointment,
    updateAppointment,
    todaysAppointment,
    userAppointment,
    consultAppointment,
    getAppointmentHistory,
    getAllApointments,
    getAllConsultedAppointments
} from "../controllers/appointmentController.js";

const router = express.Router();

// Routes
router.get("/user/:id",userAppointment);
router.get("/all",getAllApointments);
router.get("/history/:userId", getAppointmentHistory);
router.get("/history/all",getAllConsultedAppointments);
router.post("/book", bookAppointment);
router.post("/approve", approveAppointment);
router.post("/reject", rejectAppointment);
router.post("/update", updateAppointment);
router.post("/today", todaysAppointment);
router.post("/consult", consultAppointment);
export default router;
