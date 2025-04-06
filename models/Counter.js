import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});

counterSchema.statics.initializeCounter = async function () {
    // Initialize the counter document if not present
    const counterExists = await this.findById("caseNumber");
    if (!counterExists) {
        await this.create({ _id: "caseNumber", seq: 0 });
    }
};

const Counter = mongoose.model("Counter", counterSchema);
export default Counter;
