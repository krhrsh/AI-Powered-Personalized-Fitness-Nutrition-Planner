const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscle_group: [String],
  difficulty: { type: String, default: "beginner" },
  equipment: [String],
  instructions: String,
});

exerciseSchema.index({ name: "text" });

module.exports = mongoose.model("Exercise", exerciseSchema);
