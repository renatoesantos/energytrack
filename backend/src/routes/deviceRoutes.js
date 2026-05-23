const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/deviceController");
const authMiddleware = require("../middleware/authMiddleware");


router.post("/", authMiddleware, deviceController.createDevice);
router.get("/", authMiddleware, deviceController.getDevices);

module.exports = router;