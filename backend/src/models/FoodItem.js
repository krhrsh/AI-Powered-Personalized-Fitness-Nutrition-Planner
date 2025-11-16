const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: Number,
  protein_g: Number,
  carbs_g: Number,
  fat_g: Number,
  tags: [String],
  source: { type: String, default: "custom" },
});

foodSchema.index({ name: "text" });

module.exports = mongoose.model("FoodItem", foodSchema);
