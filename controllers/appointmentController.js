import Appointment from "../models/Appointment.js";
import Consultation from "../models/Consultation.js";
import Case from "../models/Case.js";
import Prescription from "../models/Prescription.js";
import Errorhandler from "../utils/errorhandler.js";
import respond from "../utils/jsonresponse.js";
import Counter from "../models/Counter.js";
import { sendAppointmentConfirmationEmail } from "../utils/otphandler.js";

// /**
//  * @desc    Book a new appointment
//  * @route   POST /api/appointments/book
//  */
// Helper function
function isWithin7Days(oldDate, newDate) {
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return newDate - oldDate <= sevenDaysMs;
}

export const bookAppointment = async (req, res, next) => {
    try {
        const { date, timeSlot, reason, isDiabetic, hasBP } = req.body;
        const doc_id = "67f1121870bd6e54238224c3";
        const user = req.user;
        console.log(req.body);

        // Validate input
        if (!date || !timeSlot || !reason) {
            throw new Errorhandler("Missing required fields", 400);
        }
        console.log("b1");

        // Check existing appointments
        const existingAppointment = await Appointment.findOne({
            patient: user._id,
            status: { $nin: ["cancelled", "consulted"] },
        });

        if (existingAppointment) {
            throw new Errorhandler("Existing active appointment found", 409);
        }

        console.log("b2");

        // Case management
        const latestCase = await Case.findOne({
            patient: user._id,
            status: "open",
        }).sort({ last_appointment_date: -1 });

        console.log("b3");

        const appointmentDate = new Date(date);
        let patientCase;

        if (
            latestCase &&
            isWithin7Days(latestCase.last_appointment_date, new Date())
        ) {
            patientCase = latestCase;
            patientCase.last_appointment_date = appointmentDate;
        } else {
            patientCase = new Case({
                patient: user._id,
                created_from_appointment_id: null, // Will be updated after appointment creation
                last_appointment_date: appointmentDate,
                status: "open",
            });
        }

        // Create appointment
        const appointment = new Appointment({
            patient: user._id,
            doctor: doc_id,
            appointmentDate,
            timeSlot,
            name: user.name,
            reason: { reasonStatement: reason, isDiabetic, hasBP },
            case: patientCase._id,
            status: "pending",
        });

        // Update case with appointment reference
        patientCase.appointment_ids.push(appointment._id);
        if (!patientCase.created_from_appointment_id) {
            patientCase.created_from_appointment_id = appointment._id;
        }

        // console.log(patientCase);
        // console.log("About to save case...");
        // console.log("Saving new case:", patientCase.isNew); // should be true for new case

        // console.log("Before saving, case_number is:", patientCase.case_number);
        await patientCase.save();
        // console.log("Case saved...");
        await appointment.save();

        respond(res, 201, "Appointment booked successfully", {
            appointment,
            case: patientCase,
        });
    } catch (error) {
        next(error);
    }
};

export const userAppointment = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { status } = req.query;

        if (!userId) {
            return next(new Errorhandler("User ID is required.", 400));
        }

        // Ensure status is an array if not already
        const statusArray = Array.isArray(status) ? status : [status];

        // Fetch all cases associated with the user
        const cases = await Case.find({ patient: userId })
            .populate({
                path: "appointment_ids",
                populate: {
                    path: "patient",
                    select: "username email role",
                    match: { role: "patient" },
                },
            })
            .sort("-created_at"); // Sort cases by creation date

        // Filter cases to only include those that have appointments with the specified status
        const filteredCases = cases.filter((caseItem) => {
            const filteredAppointments = caseItem.appointment_ids.filter(
                (appointment) => statusArray.includes(appointment.status)
            );

            // Only include the case if it has at least one matching appointment
            if (filteredAppointments.length > 0) {
                // Replace the appointments in the case with the filtered appointments
                caseItem.appointment_ids = filteredAppointments;
                return true;
            }

            return false; // Exclude cases with no matching appointments
        });

        if (filteredCases.length === 0) {
            return respond(
                res,
                200,
                "No cases found with the specified appointment status.",
                []
            );
        }

        respond(
            res,
            200,
            "Cases with appointments fetched successfully",
            filteredCases
        );
    } catch (error) {
        console.error("Error fetching cases with appointments:", error);
        next(new Errorhandler("Internal server error", 500));
    }
};

export const cancelAppointment = async (req, res, next) => {
    try {
        const { appointmentId, cancel_reason } = req.body;

        if (!appointmentId) {
            return res
                .status(400)
                .json({ error: "Appointment ID is required" });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        if (appointment.status === "cancelled") {
            return res
                .status(400)
                .json({ error: "Appointment is already cancelled" });
        }

        if (appointment.status === "consulted") {
            return res.status(400).json({
                error: "Consulted appointments cannot be cancelled directly.",
            });
        }

        // Update appointment fields
        appointment.status = "cancelled";
        appointment.cancelDate = new Date();
        if (cancel_reason) {
            appointment.notes = `Cancelled: ${cancel_reason}`;
        }
        await appointment.save();

        // Update related case
        if (appointment.case) {
            const relatedCase = await Case.findById(appointment.case);

            if (relatedCase) {
                // Remove appointmentId from case's appointment_ids
                relatedCase.appointment_ids =
                    relatedCase.appointment_ids.filter(
                        (id) => id.toString() !== appointmentId.toString()
                    );

                // If this cancelled appointment was the 'created_from_appointment_id', clear it
                if (
                    relatedCase.created_from_appointment_id?.toString() ===
                    appointmentId.toString()
                ) {
                    relatedCase.created_from_appointment_id = null;
                }

                // Check if case is now empty (no appointments and no consultations)
                const remainingAppointments = await Appointment.find({
                    _id: { $in: relatedCase.appointment_ids },
                    status: { $ne: "cancelled" }, // Only active appointments
                });

                const remainingConsultations = await Consultation.find({
                    _id: { $in: relatedCase.consultation_ids },
                });

                if (
                    remainingAppointments.length === 0 &&
                    remainingConsultations.length === 0
                ) {
                    // CASE IS EMPTY => Delete it
                    await Case.deleteOne({ _id: relatedCase._id });

                    // Decrement the Counter
                    await Counter.findByIdAndUpdate("caseNumber", {
                        $inc: { seq: -1 },
                    });

                    console.log(
                        `Case ${relatedCase.case_number} deleted and counter decremented.`
                    );
                } else {
                    // Case still has activity, update last_appointment_date
                    if (remainingAppointments.length > 0) {
                        // Find the latest appointment
                        const latestAppointment = remainingAppointments.sort(
                            (a, b) => b.appointmentDate - a.appointmentDate
                        )[0];

                        relatedCase.last_appointment_date =
                            latestAppointment.appointmentDate;
                    } else {
                        relatedCase.last_appointment_date = null;
                    }

                    await relatedCase.save();
                }
            }
        }

        res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully",
            appointment,
        });
    } catch (err) {
        console.error("Error cancelling appointment:", err);
        next(err);
    }
};

export const getConsultedAppointments = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const appointments = await Consultation.find({
            patient: userId,
        })
            .populate("appointment")
            .populate("patient")
            .populate("case");

        res.status(200).json({
            success: true,
            data: appointments,
        });
    } catch (err) {
        console.error("Error fetching consulted appointments:", err);
        next(err);
    }
};

export const rescheduleAppointment = async (req, res, next) => {
    try {
        const { appointmentId, newDate, newTimeSlot } = req.body;
        const userId = req.user?._id;

        if (!appointmentId || !newDate || !newTimeSlot) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        if (appointment.patient.toString() !== userId.toString()) {
            return res
                .status(403)
                .json({ error: "Unauthorized to reschedule this appointment" });
        }

        if (appointment.status === "cancelled") {
            return res
                .status(400)
                .json({ error: "Cannot reschedule a cancelled appointment" });
        }

        appointment.appointmentDate = new Date(newDate);
        appointment.timeSlot = newTimeSlot;
        appointment.status = "pending";
        await appointment.save();

        res.status(200).json({
            success: true,
            message: "Appointment rescheduled successfully",
            appointment,
        });
    } catch (err) {
        console.error("Error rescheduling appointment:", err);
        next(err);
    }
};

export const approveAppointment = async (req, res, next) => {
    try {
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return next(new Errorhandler("Appointment ID is required.", 400));
        }

        const appointment = await Appointment.findById(appointmentId).populate("patient");
        if (!appointment) {
            return next(new Errorhandler("Appointment not found.", 404));
        }

        appointment.status = "confirmed";
        appointment.confirmDate = new Date();
        await appointment.save();

         // Send confirmation email
        if (appointment.patient && appointment.patient.email) {
            await sendAppointmentConfirmationEmail(appointment.patient.email, appointment);
        }

        respond(res, 200, "Appointment approved successfully", appointment);
    } catch (error) {
        console.error("Error approving appointment:", error);
        next(new Errorhandler("Internal server error", 500));
    }
};

export const getAllApointments = async (req, res, next) => {
    try {
        const { status } = req.query;
        const appointments = await Appointment.find({ status }).populate(
            "patient"
        );
        res.status(200).json({
            success: true,
            data: appointments,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllConsultedAppointments = () => {};

export const consultAppointment = async (req, res, next) => {
    try {
        const { appointmentId, prescriptionImage, notes, diagnosis, followUp } =
            req.body;

        // Find the appointment by ID
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return next(new Errorhandler("Appointment not found", 404));
        }

        // Only confirmed appointments can be consulted
        if (appointment.status !== "confirmed") {
            return next(
                new Errorhandler(
                    "Only confirmed appointments can be consulted",
                    400
                )
            );
        }

        // Create and save the prescription
        const prescription = new Prescription({
            appointment: appointment._id,
            patient: appointment.patient,
            doctor: appointment.doctor,
            receptionist: appointment.receptionist,
            imageUrl: prescriptionImage,
            notes,
        });

        await prescription.save();

        // Create and save the consultation
        const consultation = new Consultation({
            case: appointment.case,
            appointment: appointment._id,
            patient: appointment.patient,
            doctor: appointment.doctor,
            receptionist: appointment.receptionist,
            diagnosis,
            prescription: prescription._id,
            follow_up: followUp || false,
            notes,
        });

        await consultation.save();

        // Update the case with the new consultation ID
        const caseToUpdate = await Case.findById(appointment.case);
        if (!caseToUpdate) {
            return next(new Errorhandler("Case not found", 404));
        }

        // Add the consultation ID to the case's consultations array
        caseToUpdate.consultation_ids.push(consultation._id);
        await caseToUpdate.save();

        // Update the appointment status to 'consulted'
        appointment.status = "consulted";
        await appointment.save();

        // Populate related fields before responding
        const populatedConsultation = await Consultation.findById(
            consultation._id
        )
            .populate("patient")
            .populate("doctor")
            .populate("prescription")
            .populate("case")
            .populate("receptionist");

        return respond(
            res,
            200,
            "Appointment marked as consulted",
            populatedConsultation
        );
    } catch (error) {
        console.error("Error marking appointment as consulted:", error);
        return next(new Errorhandler("Internal server error", 500));
    }
};

export const todaysAppointment = async (req, res, next) => {
    try {
        const doctorId = "67f1121870bd6e54238224c3";

        if (!doctorId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            doctor: doctorId,
            status: "pending",
            appointmentDate: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        })
            .populate("patient")
            .populate("case")
            .sort({ timeSlot: 1 });

        res.status(200).json({
            success: true,
            data: appointments,
        });
    } catch (error) {
        console.error("Error fetching today's appointments for doctor:", error);
        next(error);
    }
};

export const getAppointmentsByDate = async (req, res, next) => {
    try {
        const { date } = req.params;
        const doctorId = req.user?._id || "67f1121870bd6e54238224c3";

        if (!date) {
            return next(new Errorhandler("Date is required", 400));
        }

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            doctor: doctorId,
            status: "pending",
            appointmentDate: {
                $gte: startDate,
                $lte: endDate,
            },
        })
            .populate("patient")
            .populate("case")
            .sort({ timeSlot: 1 });

        respond(res, 200, "Appointments fetched successfully", appointments);
    } catch (error) {
        console.error("Error fetching appointments by date:", error);
        next(new Errorhandler("Internal Server Error", 500));
    }
};

export const getSlotCounts = async (req, res, next) => {
    try {
        const { date } = req.query;
        const appointments = await Appointment.find({
            appointmentDate: date,
            status: { $nin: ["cancelled", "consulted"] }
        }); // Exclude cancelled appointments});

        const slotCounts = {};
        appointments.forEach((appointment) => {
            slotCounts[appointment.timeSlot] =
                (slotCounts[appointment.timeSlot] || 0) + 1;
        });
        console.log(slotCounts);
        console.log(`For date  ${date}`);

        res.status(200).json({ slotCounts });
    } catch (error) {
        next(new Errorhandler("Failed to fetch slot counts", 500));
    }
};
