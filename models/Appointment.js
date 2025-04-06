import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        receptionist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Receptionist",
            default: null, // Optional during initial booking
        },
        case: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case",
            default: null,
        },
        appointmentDate: {
            type: Date,
            required: true,
            validate: {
                validator: function (date) {
                    // Only run this check when creating a new appointment
                    if (this.isNew) {
                        const tomorrow = new Date();
                        tomorrow.setHours(0, 0, 0, 0);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return date >= tomorrow;
                    }
                    return true; // skip validation on updates
                },
                message: "Cannot book an appointment in the past.",
            },
        },
        timeSlot: {
            type: String,
            enum: [
                "10:00-10:30",
                "10:30-11:00",
                "11:00-11:30",
                "11:30-12:00",
                "02:00-02:30",
                "02:30-03:00",
                "03:00-03:30",
                "03:30-04:00",
            ],
            required: true,
        },
        name: String,
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "consulted"],
            default: "pending",
        },
        reason: {
            type: {
                reasonStatement: { type: String, required: true },
                isDiabetic: { type: Boolean, default: false },
                hasBP: { type: Boolean, default: false },
            },
            required: true,
        },
        consultationType: {
            type: String,
            enum: ["new", "follow-up"],
            default: "new",
        },
        notes: {
            type: String,
            default: null,
        },
        confirmDate: {
            type: Date,
            default: null,
        },
        cancelDate: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
