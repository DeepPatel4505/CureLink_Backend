// const mongoose = require("mongoose");
import "./config.js"
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_DB_URL);
        console.log(`Database Connected Successfully via : ${connectionInstance.connection.host}`);
    } catch (err) {
        console.error(`Error connecting to the database: ${err.message}`);
    }
};

export default connectDB;
