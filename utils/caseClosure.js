import cron from "node-cron";
import Case from "../models/Case.js";
import Appointment from "../models/Appointment.js"; // Import Appointment
import { transporter } from "./otphandler.js"; // your nodemailer transporter

// const DAILY_CRON = "* * * * *"; // every time for testing
const DAILY_CRON = "0 2 * * *"; // 2 AM every day

export const scheduleDailyTasks = () => {
    cron.schedule(DAILY_CRON, async () => {
        console.log("Daily cron triggered");

        try {
            // 1. Close old cases
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const caseResult = await Case.updateMany(
                {
                    status: "open",
                    last_appointment_date: { $lte: sevenDaysAgo },
                },
                {
                    $set: {
                        status: "closed",
                        closed_at: new Date(),
                    },
                }
            );
            console.log(`Closed ${caseResult.modifiedCount} cases`);

            // 2. Send appointment reminders
            const now = new Date();
            const tomorrow = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1
            );
            const dayAfter = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 2
            );

            const appointments = await Appointment.find({
                appointmentDate: { $gte: tomorrow, $lt: dayAfter },
                status: "confirmed",
            }).populate("patient");

            // console.log(appointments);

            for (const appointment of appointments) {
                if (appointment.patient?.email) {
                    const mailOptions = {
                        from: process.env.USER,
                        to: appointment.patient.email,
                        subject:
                            "Appointment Reminder - Your Appointment is Tomorrow",
                        text: `Hello,

This is a reminder that your appointment is scheduled for ${appointment.appointmentDate} at ${appointment.timeSlot}.

Please arrive 10 minutes early.

Thank you!`,
                    };

                    await transporter.sendMail(mailOptions);
                    console.log(
                        `Reminder email sent to: ${appointment.patient.email}`
                    );
                }
            }
        } catch (error) {
            console.error("Error in daily tasks:", error);
        }
    });
};
