const axios = require("axios");
const Plan = require("../models/Plan");

const ML_SERVICE = process.env.ML_SERVICE_URL || "http://localhost:8000";

function buildFallbackPlan(profile, history, plan_type) {
  // Simple heuristic fallback when ML service is unavailable
  const baseWeight = profile.weight_kg || 70;
  const baseCalories = 30 * baseWeight; // rough 30 kcal/kg

  const calorie_estimate = Math.round(baseCalories);
  const macros = {
    protein_g: Math.round((0.3 * calorie_estimate) / 4),
    carbs_g: Math.round((0.4 * calorie_estimate) / 4),
    fat_g: Math.round((0.3 * calorie_estimate) / 9),
  };

  const meals = [
    {
      meal_type: "breakfast",
      items: [
        { name: "Oats with milk and fruit", cal: 400, qty: "1 bowl" },
      ],
    },
    {
      meal_type: "lunch",
      items: [
        { name: "Rice, dal, vegetables", cal: 700, qty: "1 plate" },
      ],
    },
    {
      meal_type: "dinner",
      items: [
        { name: "Roti with vegetables and curd", cal: 600, qty: "1 plate" },
      ],
    },
  ];

  const workout = {
    days: [
      {
        day: "Day 1",
        exercises: [
          { name: "Walking", sets: 1, reps: 30 },
          { name: "Bodyweight squats", sets: 3, reps: 12 },
        ],
      },
      {
        day: "Day 2",
        exercises: [
          { name: "Push-ups", sets: 3, reps: 10 },
          { name: "Plank", sets: 3, reps: 30 },
        ],
      },
    ],
  };

  return { calorie_estimate, macros, meals, workout };
}

async function generatePlan(req, res, next) {
  try {
    const user = req.user;
    const { plan_type } = req.body || { plan_type: "weekly" };

    // fetch user history (weight log) and profile
    const profile = {
      age: user.dob
        ? Math.floor(
            (Date.now() - new Date(user.dob)) / (1000 * 60 * 60 * 24 * 365)
          )
        : 25,
      sex: user.sex,
      height_cm: user.height_cm,
      weight_kg: user.weight_kg,
      activity_level: user.activity_level,
      goal: user.goal,
      diet_pref: user.diet_pref,
      allergies: user.allergies,
    };

    const history = { weight_log: user.weight_log || [] };

    let mlPlan;
    let planSource = "ml";
    try {
      // call ML service
      const mlRes = await axios.post(`${ML_SERVICE}/ml/generate_plan`, {
        profile,
        history,
        plan_type,
      });
      mlPlan = mlRes.data;
    } catch (mlErr) {
      console.error("ML service unavailable, using fallback plan", mlErr.message);
      mlPlan = buildFallbackPlan(profile, history, plan_type);
      planSource = "fallback";
    }

    // create plan doc
    const now = new Date();
    const plan = await Plan.create({
      user_id: user._id,
      type: plan_type,
      start_date: now,
      end_date: new Date(now.getTime() + 7 * 24 * 3600 * 1000),
      calorie_target: mlPlan.calorie_estimate,
      macros: mlPlan.macros,
      meals: mlPlan.meals,
      workout: mlPlan.workout,
      adjusted_by_ai: true,
    });

    // optionally log current weight into user's weight_log for progress chart
    if (typeof user.weight_kg === "number" && user.weight_kg > 0) {
      user.weight_log = user.weight_log || [];
      user.weight_log.push({ weight: user.weight_kg, date: now });
      await user.save();
    }

    res.status(201).json({ plan, source: planSource });
  } catch (err) {
    console.error("generatePlan error", err.message);
    next(err);
  }
}

async function getPlanById(req, res, next) {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: "not found" });
    if (plan.user_id.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "forbidden" });
    res.json({ plan });
  } catch (err) {
    next(err);
  }
}

async function getLastPlan(req, res, next) {
  try {
    const plan = await Plan.findOne({ user_id: req.user._id })
      .sort({ start_date: -1 })
      .lean();
    if (!plan) return res.status(404).json({ error: "not found" });
    res.json({ plan });
  } catch (err) {
    next(err);
  }
}

async function getMyPlans(req, res, next) {
  try {
    const plans = await Plan.find({ user_id: req.user._id })
      .sort({ start_date: -1 })
      .limit(5)
      .lean();
    res.json({ plans });
  } catch (err) {
    next(err);
  }
}

module.exports = { generatePlan, getPlanById, getLastPlan, getMyPlans };
