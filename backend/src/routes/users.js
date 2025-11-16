const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getMe, updateMe, addWeight } = require("../controllers/userController");

router.get("/me", auth, getMe);
router.put("/me", auth, updateMe);
router.post("/me/weight", auth, addWeight);

module.exports = router;
