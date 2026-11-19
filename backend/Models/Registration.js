const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },

        studentId: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["registered", "canceled"],
            default: "registered"
        }
    },
    {
        timestamps: true
    }
);

// Prevent a student from registering twice for the same event
registrationSchema.index(
    { event: 1, studentId: 1 },
    { unique: true }
);

module.exports = mongoose.model("Registration", registrationSchema);
