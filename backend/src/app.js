const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const consumptionRoutes = require("./routes/consumptionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/consumption", consumptionRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;