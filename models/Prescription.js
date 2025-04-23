import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
    {
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
        imageUrl: {
            type: String,
            required: true,
        },
        fileName: {
            type: String,
            default: null, // Optional, helpful for UI/file management
        },
        contentType: {
            type: String,
            default: "image/png", // or "application/pdf" if allowed
        },
        notes: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
