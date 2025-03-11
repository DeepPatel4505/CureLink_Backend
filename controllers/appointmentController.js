import Appointment from "../models/Appointment.js";
import Errorhandler from "../utils/errorhandler.js";
import respond from "../utils/jsonresponse.js";

// /**
//  * @desc    Book a new appointment
//  * @route   POST /api/appointments/book
//  */
export const bookAppointment = async (req, res, next) => {
    try {
        const { name, date, timeslot, reason, isDiabetic, hasBP } = req.body;
        const user = req.user; // Assuming user is authenticated and stored in req.user

        if (!user || !user._id) {
            return next(new Errorhandler("User authentication required.", 400));
        }

        if (!date || !timeslot || !reason) {
            return next(new Errorhandler("Date, time slot, and reason are required.", 400));
        }

        const appointment = new Appointment({
            patient: user._id, 
            name: name || user.username,
            appointmentDate: date,
            timeSlot: timeslot,
            reason: {
                reasonStatement: reason,
                isDiabetic: isDiabetic || false,
                hasBP: hasBP || false,
            },
        });

        await appointment.save();
        respond(res, 201, "Appointment booked successfully, waiting for confirmation", appointment);
    } catch (error) {
        console.error("Error booking appointment:", error);
        next(new Errorhandler("Internal server error", 500));
    }
};

// /**
//  * @desc    Approve an appointment
//  * @route   POST /api/appointments/approve
//  */
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

        appointment.status = "approved";
        await appointment.save();

        respond(res, 200, "Appointment approved successfully", appointment);
    } catch (error) {
        console.error("Error approving appointment:", error);
        next(new Errorhandler("Internal server error", 500));
    }
};

// /**
//  * @desc    Reject an appointment
//  * @route   POST /api/appointments/reject
//  */
export const rejectAppointment = async (req, res, next) => {
    try {
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return next(new Errorhandler("Appointment ID is required.", 400));
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return next(new Errorhandler("Appointment not found.", 404));
        }

        appointment.status = "rejected";
        await appointment.save();

        respond(res, 200, "Appointment rejected successfully", appointment);
    } catch (error) {
        console.error("Error rejecting appointment:", error);
        next(new Errorhandler("Internal server error", 500));
    }
};

// /**
//  * @desc    Update appointment details
//  * @route   POST /api/appointments/update
//  */
export const updateAppointment = async (req, res, next) => {
    try {
        const { appointmentId, date, timeslot, reason } = req.body;

        if (!appointmentId) {
            return next(new Errorhandler("Appointment ID is required.", 400));
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return next(new Errorhandler("Appointment not found.", 404));
        }

        if (date) appointment.appointmentDate = new Date(date);
        if (timeslot) appointment.timeSlot = timeslot;
        if (reason) appointment.reason.reasonStatement = reason;

        await appointment.save();
        respond(res, 200, "Appointment updated successfully", appointment);
    } catch (error) {
        console.error("Error updating appointment:", error);
        next(new Errorhandler("Internal server error", 500));
    }
};


 // @desc    Get today's appointments
  //@route   POST /api/appointments/today

export const todaysAppointment = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointments = await Appointment.find({
            appointmentDate: { $gte: today },
        }).populate("patient", "name email");

        if (!appointments.length) {
            return next(new Errorhandler("No appointments found for today.", 404));
        }

        respond(res, 200, "Today's appointments fetched successfully", appointments);
    } catch (error) {
        console.error("Error fetching today's appointments:", error);
        next(new Errorhandler("Internal server error", 500));
    }
};
