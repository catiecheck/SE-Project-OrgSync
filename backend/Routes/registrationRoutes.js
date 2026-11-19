const express = require("express");
const mongoose = require("mongoose");

const Registration = require("../Models/Registration");
const Event = require("../Models/Event");

const router = express.Router();

// Register a student for an event
router.post("/", async (req, res) => {
    try {
        const { eventId, studentId } = req.body;

        // Validate required information
        if (!eventId || !studentId || typeof studentId !== "string" ||
            !studentId.trim()) {
            return res.status(400).json({
                message: "Event ID and student ID are required"
            });
        }

        if (!mongoose.isValidObjectId(eventId)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        // Check that the event exists
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        // Prevent registration for past or canceled events
        if (event.date <= new Date() || event.status === "canceled") {
            return res.status(400).json({
                message: "Registration is closed for this event"
            });
        }

        const normalizedStudentId = studentId.trim();

        // Check for an existing registration
        const existingRegistration = await Registration.findOne({
            event: eventId,
            studentId: normalizedStudentId
        });

        if (existingRegistration) {
            return res.status(409).json({
                message: "Student already has a registration for this event"
            });
        }

        const registration = await Registration.create({
            event: eventId,
            studentId: normalizedStudentId
        });

        return res.status(201).json({
            message: "Registration successful",
            registration
        });

    } catch (error) {
        // Handle duplicate registrations if two requests arrive together
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Student already has a registration for this event"
            });
        }

        console.error("Registration error:", error.message);

        return res.status(500).json({
            message: "Failed to register for event"
        });
    }
});

// Retrieve registrations for a demo student
router.get("/student/:studentId", async (req, res) => {
    try {
        const registrations = await Registration.find({
            studentId: req.params.studentId
        }).populate("event");

        return res.status(200).json(registrations);

    } catch (error) {
        console.error("Error retrieving registrations:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve registrations"
        });
    }
});

module.exports = router;
