import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
    {
        case: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case",
            required: true,
        },
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
        },
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
        },
        date: {
            type: Date,
            default: Date.now,
        },
        diagnosis: {
            type: String,
        },
        prescription: {
            type: String,
        },
        follow_up: {
            type: Boolean,
            default: false,
        },
        notes: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: false },
    }
);

const Consultation = mongoose.model("Consultation", consultationSchema);
export default Consultation;
