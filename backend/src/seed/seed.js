require("dotenv").config();
const connectDB = require("../config/db");
const FoodItem = require("../models/FoodItem");
const Exercise = require("../models/Exercise");

async function seed() {
  await connectDB();
  await FoodItem.deleteMany({});
  await Exercise.deleteMany({});

  const foods = [
    {
      name: "Oats (50g)",
      calories: 190,
      protein_g: 6.5,
      carbs_g: 33,
      fat_g: 3.5,
      tags: ["breakfast", "vegetarian"],
    },
    {
      name: "Boiled Egg (1 large)",
      calories: 78,
      protein_g: 6.3,
      carbs_g: 0.6,
      fat_g: 5.3,
      tags: ["breakfast", "high-protein"],
    },
    {
      name: "Grilled Chicken (100g)",
      calories: 165,
      protein_g: 31,
      carbs_g: 0,
      fat_g: 3.6,
      tags: ["lunch", "high-protein"],
    },
    {
      name: "Brown Rice (100g cooked)",
      calories: 111,
      protein_g: 2.6,
      carbs_g: 23,
      fat_g: 0.9,
      tags: ["carb"],
    },
  ];

  const exercises = [
    {
      name: "Push-up",
      muscle_group: ["chest", "triceps"],
      difficulty: "beginner",
      equipment: ["bodyweight"],
      instructions: "Keep back straight, lower chest to near floor",
    },
    {
      name: "Squat",
      muscle_group: ["legs", "glutes"],
      difficulty: "beginner",
      equipment: ["bodyweight"],
      instructions: "Keep chest up, push hips back",
    },
    {
      name: "Plank",
      muscle_group: ["core"],
      difficulty: "beginner",
      equipment: ["bodyweight"],
      instructions: "Hold straight position on elbows",
    },
  ];

  await FoodItem.insertMany(foods);
  await Exercise.insertMany(exercises);

  console.log("Seeded food items and exercises");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
