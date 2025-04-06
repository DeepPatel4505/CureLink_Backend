import Appointment from "../models/Appointment.js";
import Consultation from "../models/Consultation.js";
import Case from "../models/Case.js";
import Prescription from "../models/Prescription.js";
import Errorhandler from "../utils/errorhandler.js";
import respond from "../utils/jsonresponse.js";

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
            isWithin7Days(latestCase.last_appointment_date, appointmentDate)
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

        const filter = { patient: userId };
        if (status) {
            filter.status = status;
        }

        // Make sure to query AppointmentHistory for consulted appointments

        const appointments = await Appointment.find(filter)
            .populate({
                path: "patient",
                select: "username email role",
                match: { role: "patient" },
            })
            .sort("-createdAt");

        respond(res, 200, "Appointments fetched successfully", appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        next(new Errorhandler("Internal server error", 500));
    }
};


export const cancelAppointment = async (req, res, next) => {
    try {
        const { appointmentId, cancel_reason  } = req.body;

        if (!appointmentId) {
            return res.status(400).json({ error: "Appointment ID is required" });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        if (appointment.status === "cancelled") {
            return res.status(400).json({ error: "Appointment is already cancelled" });
        }

        // Optional: Check user permission if needed
        // if (appointment.patient.toString() !== userId.toString()) {
        //     return res.status(403).json({ error: "Unauthorized" });
        // }

        appointment.status = "cancelled";
        appointment.cancelDate = new Date(); // If you track this
        await appointment.save();


        // Optional: update the Case if needed
        if (appointment.case) {
            await Case.findByIdAndUpdate(appointment.case, {
                $set: {
                    closed_at: new Date(),
                    is_active : false,
                    cancel_reason: cancel_reason || "Appointment cancelled",
                    status: "void", // Or handle however you need
                },
            });
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

        const appointments = await Appointment.find({
            patient: userId,
            status: "consulted",
        })
            .populate("doctor")
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
            return res.status(403).json({ error: "Unauthorized to reschedule this appointment" });
        }

        if (appointment.status === "cancelled") {
            return res.status(400).json({ error: "Cannot reschedule a cancelled appointment" });
        }

        appointment.appointmentDate = new Date(newDate);
        appointment.timeSlot = newTimeSlot;
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

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return next(new Errorhandler("Appointment not found.", 404));
        }

        appointment.status = "confirmed";
        appointment.confirmDate = new Date()
        await appointment.save();

        respond(res, 200, "Appointment approved successfully", appointment);
    } catch (error) {
        console.error("Error approving appointment:", error);
        next(new Errorhandler("Internal server error", 500));
    }
};

export const getAllApointments = async (req, res, next) => {
    try {
        const { status } = req.query;
        const appointments = await Appointment.find({ status });
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

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return next(new Errorhandler("Appointment not found", 404));
        }

        if (appointment.status !== "confirmed") {
            return next(
                new Errorhandler(
                    "Only confirmed appointments can be consulted",
                    400
                )
            );
        }

        const consultation = new Consultation({
            case: appointment.case,
            appointment: appointment._id,
            patient: appointment.patient,
            doctor: appointment.doctor,
            receptionist: appointment.receptionist,
            diagnosis,
            prescription: prescriptionImage,
            follow_up: followUp || false,
            notes,
        });

        // Save the consultation
        await consultation.save();

        // Optionally, you can delete the original appointment or mark it as "consulted"
        appointment.status = "consulted";
        await appointment.save();
        // Respond with the newly created consultation entry
        respond(res, 200, "Appointment marked as consulted", consultation);
    } catch (error) {
        console.error("Error marking appointment as consulted:", error);
        next(new Errorhandler("Internal server error", 500));
    }
};

export const todaysAppointment = async (req, res, next) => {
    try {
        const doctorId = "67f1121870bd6e54238224c3";

        if (!doctorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            doctor: doctorId,
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
