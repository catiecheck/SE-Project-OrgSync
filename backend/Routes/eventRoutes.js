const express = require('express');
const mongoose = require('mongoose');
const Event = require('../Models/Event');
const EventService = require("../Services/EventService");



const router = express.Router();

// Getting all Events

router.get("/", async (req, res) => {
    try {
        const organizationName =
            typeof req.query.organization === "string"
                ? req.query.organization.trim()
                : "";

        const events = await EventService.getUpcomingEvents(organizationName);

        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error.message);

        res.status(500).json({
            message: "Failed to retrieve upcoming events"
        });
    }
});

// getting a single event by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json(event);
    } catch (error) {
        console.error("Error fetching event:", error.message);
        res.status(500).json({
            message: "Failed to retrieve event"
        });
    }
});

module.exports = router;