// models/Prescription.js
import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AppointmentHistory",
        // Making this optional to match your current controller implementation
        required: false,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;