require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Event = require("./Models/Event");


const demoEvents = [
    {
        title: "Python for Beginners Workshop",
        description: "Learn Python fundamentals through hands-on coding activities.",
        organization: "Girls Who Code",
        date: new Date("2026-12-03T18:00:00-05:00"),
        location: "IT Building Room 2101",
        status: "scheduled"
    },
    {
        title: "Engineering Career Prep Night",
        description: "Explore internship opportunities, resume tips, and interview preparation.",
        organization: "Society of Women Engineers",
        date: new Date("2026-12-05T17:00:00-05:00"),
        location: "Engineering Building Room 1200",
        status: "scheduled"
    },
    {
        title: "Tech Networking Mixer",
        description: "Connect with fellow technology students and build professional relationships.",
        organization: "National Society of Black Engineers",
        date: new Date("2026-12-08T18:30:00-05:00"),
        location: "Student Union Meeting Room",
        status: "scheduled"
    },
    {
        title: "Web Development Bootcamp",
        description: "Build a responsive website using HTML, CSS, and JavaScript in a beginner-friendly workshop.",
        organization: "Girls Who Code",
        date: new Date("2026-12-02T16:00:00-05:00"),
        location: "IT Building Room 2205",
        status: "scheduled"
    },
    {
        title: "Resume and LinkedIn Workshop",
        description: "Get hands-on feedback on your resume and learn how to improve your LinkedIn profile.",
        organization: "Society of Women Engineers",
        date: new Date("2026-12-04T15:30:00-05:00"),
        location: "Engineering Building Room 1302",
        status: "scheduled"
    },
    {
        title: "AI and Machine Learning Seminar",
        description: "Explore how artificial intelligence and machine learning are used in real-world applications.",
        organization: "Association for Computing Machinery",
        date: new Date("2026-12-07T17:00:00-05:00"),
        location: "Russel Union Auditorium",
        status: "scheduled"
    },
    {
        title: "Women in Tech Panel Discussion",
        description: "Hear from women in technology about their career journeys, challenges, and professional growth.",
        organization: "Girls Who Code",
        date: new Date("2026-12-10T18:00:00-05:00"),
        location: "Student Union Ballroom",
        status: "scheduled"
    },
    {
        title: "End-of-Semester Coding Social",
        description: "Join fellow computing students for coding challenges, networking, and end-of-semester activities.",
        organization: "Association for Computing Machinery",
        date: new Date("2026-12-11T16:30:00-05:00"),
        location: "IT Building Room 2101",
        status: "scheduled"
    }
];


async function seedEvents() {
    try {
        await connectDB();

        console.log("Connected to MongoDB");

        for (const event of demoEvents) {
            const existingEvent = await Event.findOne({
                title: event.title,
                organization: event.organization,
                date: event.date
            });

            if (!existingEvent) {
                await Event.create(event);
                console.log(`Created: ${event.title}`);
            } else {
                console.log(`Already exists: ${event.title}`);
            }
        }

        console.log("Demo events are ready!");
    } catch (error) {
        console.error("Error seeding events:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedEvents();