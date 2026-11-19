require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const eventRoutes = require("./Routes/eventRoutes");
const registrationRoutes = require("./Routes/registrationRoutes");


const app = express();
// Middleware
app.use(cors());
app.use(express.json());

// Event API
app.use("/api/events", eventRoutes);

// Registration API
app.use("/api/registrations", registrationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "OrgSync backend is running" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};


startServer();