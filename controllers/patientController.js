import { Patient } from "../models/Patient.js";
import Case from "../models/Case.js";
import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";
import Errorhandler from "../utils/errorhandler.js";
import respond from "../utils/jsonresponse.js";

// Get all patients with pagination and search
export const getAllPatients = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        const query = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: "i" } },
                      { email: { $regex: search, $options: "i" } },
                      { phone: { $regex: search, $options: "i" } },
                  ],
              }
            : {};

        const patientsResult = await Patient.paginate(query, {
            page: parseInt(page),
            limit: parseInt(limit),
            select: "-password -__v",
            sort: { createdAt: -1 },
        });

        const patientsWithDetails = await Promise.all(
            patientsResult.docs.map(async (patient) => {
                const caseCount = await Case.countDocuments({
                    patient: patient._id,
                });

                // Find the latest appointment for the patient
                const lastAppointment = await Appointment.findOne({
                    patient: patient._id,
                })
                    .sort({ appointmentDate: -1 })
                    .select("appointmentDate");

                return {
                    ...patient.toObject(),
                    caseCount,
                    lastVisited: lastAppointment?.appointmentDate || null,
                };
            })
        );

        respond(res, 200, "Patients retrieved successfully", {
            patients: patientsWithDetails,
            total: patientsResult.total,
            totalPages: patientsResult.totalPages,
            currentPage: patientsResult.page,
        });
    } catch (error) {
        console.error(error);
        next(new Errorhandler("Failed to retrieve patients", 500));
    }
};
// Get cases for a specific patient
export const getPatientCases = async (req, res, next) => {
    try {
        const patientId = req.params.id;

        // Fetch cases for the patient
        let cases = await Case.find({ patient: patientId })
            .populate([
                {
                    path: "appointment_ids",
                    match: { status: "consulted" }, // ✅ Only consulted appointments
                    select: "appointmentDate status reason",
                    options: { sort: { appointmentDate: -1 } },
                },
                {
                    path: "consultation_ids",
                    select: "consultationDate diagnosis notes", // ✅ Select fields you want from Consultation
                    populate: {
                        path: "doctor",
                        select: "name specialization", // ✅ Doctor details inside Consultation
                    },
                }
            ])
            .select("-__v -updated_at");

        // Filter cases that have at least one consulted appointment
        cases = cases.filter((c) => c.appointment_ids.length > 0);

        if (cases.length === 0) {
            return next(new Errorhandler("No consulted cases found for this patient", 404));
        }

        respond(res, 200, "Patient cases retrieved successfully", cases);
    } catch (error) {
        next(new Errorhandler("Failed to retrieve patient cases", 500));
    }
};



// Get appointments for a specific case
export const getCaseAppointments = async (req, res, next) => {
    try {
        const { patientId, caseId } = req.params;

        const appointments = await Appointment.find({
            case: caseId,
            patient: patientId,
            status : "consulted"
        })
            .populate("doctor", "name specialization")
            .select("-__v -createdAt -updatedAt")
            .sort({ appointmentDate: -1 });

        if (!appointments || appointments.length === 0) {
            return next(
                new Errorhandler("No appointments found for this case", 404)
            );
        }

        respond(
            res,
            200,
            "Case appointments retrieved successfully",
            appointments
        );
    } catch (error) {
        next(new Errorhandler("Failed to retrieve case appointments", 500));
    }
};

// Get prescription for a consultation
export const getConsultationPrescription = async (req, res, next) => {
    try {
        const consultationId = req.params.consultationId;

        const prescription = await Prescription.findOne({
            appointment: consultationId,
        })
            .populate("doctor", "name licenseNumber")
            .populate("patient", "name age gender");

        
        if (!prescription) {
            return next(new Errorhandler("Prescription not found", 404));
        }

        respond(res, 200, "Prescription retrieved successfully", prescription);
    } catch (error) {
        next(new Errorhandler("Failed to retrieve prescription", 500));
    }
};
