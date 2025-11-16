const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: { type: String, enum: ["daily", "weekly"], default: "weekly" },
  start_date: Date,
  end_date: Date,
  calorie_target: Number,
  macros: {
    protein_g: Number,
    carbs_g: Number,
    fat_g: Number,
  },
  meals: [mongoose.Schema.Types.Mixed],
  workout: mongoose.Schema.Types.Mixed,
  adjusted_by_ai: { type: Boolean, default: true },
  feedback: {
    avg_rating: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Plan", planSchema);
