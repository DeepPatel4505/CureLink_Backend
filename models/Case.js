import mongoose from "mongoose";
import Counter from "./Counter.js";

const caseSchema = new mongoose.Schema(
    {
        case_number: {
            type: Number,
            unique: true,
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: ["open", "closed", "void"],
            default: "open",
        },
        created_from_appointment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        },
        appointment_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Appointment",
            },
        ],
        consultation_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Consultation",
            },
        ],
        last_appointment_date: {
            type: Date,
            required: true,
        },
        closed_at: {
            type: Date,
            default: null,
        },
        closed_by: {
            type: String,
            enum: ["doctor", "system"],
            default: "system",
        },
        remarks: {
            type: String,
            default: null,
        },
        cancel_reason: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: false },
    }
);

// Auto-increment case_number on creation
caseSchema.pre("save", async function (next) {
    if (!this.isNew) return next();

    try {
        await Counter.initializeCounter();

        const counter = await Counter.findByIdAndUpdate(
            "caseNumber",
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        if (!counter) {
            throw new Error("Counter not found or updated");
        }

        this.case_number = counter.seq;
        next();
    } catch (err) {
        next(err);
    }
});

const Case = mongoose.model("Case", caseSchema);
export default Case;
