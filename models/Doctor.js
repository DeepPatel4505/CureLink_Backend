import mongoose from "mongoose";
import User from "./User.js";

const doctorSchema = new mongoose.Schema(
    {
        specialization: { type: String, required: true },
        licenseNumber: { type: String, required: true },
        experience: { type: Number, required: true }, // in years
        bio: { type: String, default: null },
        phone: {
            type: String,
            match: /^[0-9]{10,15}$/, // basic validation
            default: null,
        },
        consultation_fee: {
            type: Number,
        },
        availability: {
            type: Boolean,
            default: true,
        },
        schedule: [
            {
                day: {
                    type: String,
                    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    required: true,
                },
                start_time: {
                    type: String, // Format: "HH:MM"
                    required: true,
                },
                end_time: {
                    type: String, // Format: "HH:MM"
                    required: true,
                },
            },
        ],
    },
    { timestamps: true }
);

const Doctor = User.discriminator("Doctor", doctorSchema);
export default Doctor;
