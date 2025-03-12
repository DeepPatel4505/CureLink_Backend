import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // doctor: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Doctor',
        //     required: true,
        // },
        name: {
            type: String,
            required: true,
        },
        appointmentDate: {
            type: Date,
            required: true,
            default: Date.now,
            validate: {
                validator: function (date) {
                    return date >= new Date(); // Ensures appointment is not in the past
                },
                message: "Cannot book an appointment before today.",
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
        status: {
            type: String,
            enum: ["pending", "approved", "rejected","consulted"],
            default: "pending",
        },
        reason: {
            type: {
                reasonStatement: { type: String, required: true },
                isDiabetic: { type: Boolean, default: false },
                hasBP: { type: Boolean, default: false },
            }
        },
    },
    { timestamps: true }
)

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
