import express from "express";
import {
    bookAppointment,
    userAppointment,
    getAllApointments,
    cancelAppointment,
    getConsultedAppointments,
    rescheduleAppointment,
    approveAppointment,
    consultAppointment,
    todaysAppointment,
    getAppointmentsByDate
} from "../controllers/appointmentController.js";

const router = express.Router();

// Routes

//user
router.get("/user/:id",userAppointment);
router.post("/book", bookAppointment);
router.post("/cancel", cancelAppointment);
router.get("/consulted/:userId", getConsultedAppointments);
router.post("/reschedule", rescheduleAppointment);

// //receptionist
router.get("/all",getAllApointments);
router.post("/approve", approveAppointment);
router.post("/consult", consultAppointment);

// //doctor
router.get("/today", todaysAppointment);
router.get("/byDate/:date", getAppointmentsByDate);
export default router;
