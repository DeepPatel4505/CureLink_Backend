import mongoose from "mongoose";
import Appointment from "./Appointment.js"; // Import the original schema

// Create a new schema using the original appointment schema's definition
const appointmentHistorySchema = new mongoose.Schema(
    {
        ...Appointment.schema.obj, // Properly spread the schema definition
        prescription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Prescription",
        },
        consultedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        // Explicitly add _id field since we're extending another schema
        _id: true,
    }
);

// Remove conflicting _id field from nested objects if needed
delete appointmentHistorySchema.obj._id;

const AppointmentHistory = mongoose.model(
    "AppointmentHistory",
    appointmentHistorySchema
);

export default AppointmentHistory;