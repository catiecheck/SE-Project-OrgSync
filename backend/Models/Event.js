const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        organization: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: Date,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["upcoming", "scheduled", "canceled"],
            default: "scheduled"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);