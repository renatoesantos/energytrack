const express = require("express");
const router = express.Router();
const controller = require("../controllers/consumptionController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, controller.getConsumptions);
router.post("/", authMiddleware, controller.createConsumption);
router.get("/metrics", authMiddleware, controller.getMetrics);
router.get("/by-hour", authMiddleware, controller.getConsumptionByHour);

module.exports = router;