import mongoose from "mongoose";
import User from "./User.js";
import Appointment from "./Appointment.js";

const clinicAdminSchema = new mongoose.Schema({
    clinicName: { type: String, required: true },
    clinicAddress: { type: String, required: true },
});

clinicAdminSchema.methods.approveAppointment = async function (appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (appointment && appointment.status === "pending") {
        appointment.status = "approved";
        await appointment.save();
        return appointment;
    }
    throw new Error("Appointment cannot be approved");
};

clinicAdminSchema.methods.rejectAppointment = async function (appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (appointment && appointment.status === "pending") {
        appointment.status = "rejected";
        await appointment.save();
        return appointment;
    }
    throw new Error("Appointment cannot be rejected");
};

const ClinicAdmin = User.discriminator("clinic_admin", clinicAdminSchema);
export default ClinicAdmin;
