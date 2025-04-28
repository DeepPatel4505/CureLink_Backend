import express from "express";
import {
    getAllPatients,
    getPatientCases,
    getCaseAppointments,
    getConsultationPrescription,
} from "../controllers/patientController.js";

const router = express.Router();

// Patient routes
router.get("/", getAllPatients);
router.get("/:id/cases", getPatientCases);
router.get("/:patientId/cases/:caseId/appointments", getCaseAppointments);
router.get(
    "/consultations/:consultationId/prescription",
    getConsultationPrescription
);

export default router;
