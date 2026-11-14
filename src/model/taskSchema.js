import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: 80
        },
        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 1000
        },
        date: {
            type: Number,
            required: [true, "Date is required"],
        },
        startTime: {
            type: Number,
            required: [true, "Start time is required"],
        },
        endTime: {
            type: Number,
            default: null,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", ""],
            default: ""
        },
        status: {
            type: String,
            enum: ["in_progress", "completed"],
            default: "in_progress"
        },
    },
    { timestamps: true, versionKey: false }
);

taskSchema.index({ date: 1, startTime: 1 });
export default mongoose.model("Task", taskSchema);