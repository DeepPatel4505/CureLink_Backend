import mongoose from "mongoose";
import User from "./User.js";

const receptionistSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            match: /^[0-9]{10,15}$/,
            required: true,
        },
        shift: {
            type: String,
            enum: ["morning", "evening", "night"],
            default: "morning",
        },
        assigned_desk: {
            type: String,
            default: null,
        },
        joining_date: {
            type: Date,
            default: Date.now,
        },
        notes: {
            type: String,
            default: null,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Receptionist = User.discriminator("Receptionist", receptionistSchema);
export default Receptionist;
