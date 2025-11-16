const mongoose = require("mongoose");

const weightLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  weight: Number,
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  dob: Date,
  sex: { type: String, enum: ["male", "female", "other"], default: "male" },
  height_cm: Number,
  weight_kg: Number,
  activity_level: { type: String, default: "lightly_active" },
  goal: { type: String, default: "maintain" },
  diet_pref: [String],
  allergies: [String],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  weight_log: [weightLogSchema],
});

module.exports = mongoose.model("User", userSchema);
