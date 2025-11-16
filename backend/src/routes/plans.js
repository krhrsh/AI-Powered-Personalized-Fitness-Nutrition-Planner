const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  generatePlan,
  getPlanById,
  getLastPlan,
  getMyPlans,
} = require("../controllers/planController");

router.post("/generate", auth, generatePlan);
router.get("/latest", auth, getLastPlan);
router.get("/me", auth, getMyPlans);
router.get("/:id", auth, getPlanById);

module.exports = router;
