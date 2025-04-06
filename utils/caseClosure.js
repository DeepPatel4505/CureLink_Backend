import cron from "node-cron";
import Case from "../models/Case.js";

// const CASE_CLOSURE_CRON = "* * * * *"; // Daily at 2 AM
const CASE_CLOSURE_CRON = "0 2 * * *"; // Daily at 2 AM

export const scheduleCaseClosure = () => {
    cron.schedule(CASE_CLOSURE_CRON, async () => {
        // console.log("Case closure cron triggered");
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const result = await Case.updateMany(
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

            console.log(`Closed ${result.modifiedCount} cases`);
        } catch (error) {
            console.error("Case closure error:", error);
        }
    });
};
