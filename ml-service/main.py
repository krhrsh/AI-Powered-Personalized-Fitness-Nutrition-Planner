from fastapi import FastAPI
from pydantic import BaseModel, Field
import joblib
import numpy as np
import os
import random

MODEL_PATH = os.environ.get('MODEL_PATH', 'models/calorie_regressor.joblib')
# load model if available (handle missing model gracefully)
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
else:
    model = None

app = FastAPI(title="AI Fitness ML Service")

class FoodItem(BaseModel):
    id: str = Field(alias="_id")
    name: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    tags: list[str] = []

class ExerciseItem(BaseModel):
    id: str = Field(alias="_id")
    name: str
    muscle_group: list[str] = []
    difficulty: str
    equipment: list[str] = []

class Profile(BaseModel):
    age: int
    sex: str  # 'male'|'female'
    height_cm: float
    weight_kg: float
    activity_level: str  # 'sedentary'|'lightly_active'|'moderately_active'|'very_active'|'extra_active'
    goal: str  # 'lose'|'maintain'|'gain'
    diet_pref: list = []
    allergies: list = []

class History(BaseModel):
    weight_log: list = []

class GeneratePlanRequest(BaseModel):
    profile: Profile
    history: History | None = None
    plan_type: str = 'weekly'
    available_foods: list[FoodItem] = []
    available_exercises: list[ExerciseItem] = []

activity_map = {
    'sedentary': 0,
    'lightly_active': 1,
    'moderately_active': 2,
    'very_active': 3,
    'extra_active': 4
}
goal_map = {'lose':0,'maintain':1,'gain':2}

@app.post('/ml/calories')
def predict_calories(profile: Profile):
    if model is None:
        return {'error': 'Model not trained. Run train.py to create model.'}
    sex = 1 if profile.sex == 'male' else 0
    activity = activity_map.get(profile.activity_level, 1)
    goal = goal_map.get(profile.goal, 1)
    feat = np.array([[profile.age, sex, profile.height_cm, profile.weight_kg, activity, goal]])
    pred = model.predict(feat)[0]
    return {'calorie_estimate': int(pred)}

def macro_split(calories: int, goal: str, weight_kg: float):
    # Protein target (grams per kg of body weight)
    if goal == 'gain':
        protein_per_kg = 1.8
    elif goal == 'lose':
        protein_per_kg = 1.6
    else:
        protein_per_kg = 1.4

    protein_g = int(protein_per_kg * (weight_kg or 70))
    protein_kcal = protein_g * 4

    # Fat target: 25% of total calories
    fat_kcal = int(0.25 * calories)
    fat_g = int(fat_kcal / 9)

    # Carbs fill the remainder
    carbs_kcal = calories - protein_kcal - fat_kcal
    carbs_g = int(carbs_kcal / 4) if carbs_kcal > 0 else 0

    return {"protein_g": protein_g, "carbs_g": carbs_g, "fat_g": fat_g}


def generate_meals_by_macro(calorie_est: int, foods: list[FoodItem], target_macros: dict):
    # Sort foods to favor high-protein options first for better macro targeting
    sorted_foods = sorted(foods, key=lambda f: f.protein_g, reverse=True)

    meals: list[dict] = []
    meal_types = ["breakfast", "lunch", "dinner", "snack"]

    meal_cal_targets = {
        "breakfast": int(calorie_est * 0.30),
        "lunch": int(calorie_est * 0.35),
        "dinner": int(calorie_est * 0.30),
        "snack": int(calorie_est * 0.05),
    }

    current_macros = {"protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0}

    for meal_type in meal_types:
        meal_items: list[dict] = []
        remaining_cal = meal_cal_targets[meal_type]

        available_foods = list(sorted_foods)
        random.shuffle(available_foods)

        for food in available_foods:
            if remaining_cal <= 0:
                break

            servings = random.randint(1, 2)
            food_cal = food.calories * servings

            if food_cal <= remaining_cal:
                meal_items.append({
                    "food_id": food.id,
                    "name": food.name,
                    "cal": food_cal,
                    "protein_g": food.protein_g * servings,
                    "carbs_g": food.carbs_g * servings,
                    "fat_g": food.fat_g * servings,
                    "qty": f"{servings} serving(s)",
                })
                remaining_cal -= food_cal

                current_macros["protein_g"] += food.protein_g * servings
                current_macros["carbs_g"] += food.carbs_g * servings
                current_macros["fat_g"] += food.fat_g * servings

        if meal_items:
            meals.append({"meal_type": meal_type, "items": meal_items})

    return meals


def generate_workout(goal: str, activity_level: str, exercises: list[ExerciseItem]):
    # Determine difficulty & days per week
    if activity_level in ["sedentary", "lightly_active"]:
        difficulty = "beginner"
        days_per_week = 3
        focus_groups = ["legs", "chest", "back", "core"]
    elif activity_level == "moderately_active":
        difficulty = "intermediate"
        days_per_week = 4
        focus_groups = ["chest", "back", "legs", "shoulders"]
    else:
        difficulty = "expert"
        days_per_week = 5
        focus_groups = ["chest", "back", "legs", "arms", "shoulders"]

    # Sets / reps per goal
    if goal == "gain":
        sets_range = (3, 4)
        reps_range = (8, 12)
        rest_s = 60
    elif goal == "lose":
        sets_range = (3, 4)
        reps_range = (12, 15)
        rest_s = 45
    else:
        sets_range = (3, 5)
        reps_range = (6, 10)
        rest_s = 90

    workout_days: list[dict] = []
    all_days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    for day_index in range(days_per_week):
        day_name = all_days[day_index * 2 % len(all_days)]
        group_index = day_index % len(focus_groups)
        primary_group = focus_groups[group_index]

        filtered_exercises = [
            e
            for e in exercises
            if primary_group in e.muscle_group
            and e.difficulty.lower() in [difficulty, "beginner"]
        ]

        if not filtered_exercises:
            continue

        selected_exercises = random.sample(
            filtered_exercises, min(len(filtered_exercises), 4)
        )

        day_exercises: list[dict] = []
        for ex in selected_exercises:
            sets = random.randint(*sets_range)
            reps = str(random.randint(reps_range[0], reps_range[1]))
            day_exercises.append(
                {
                    "exercise_id": ex.id,
                    "name": ex.name,
                    "sets": sets,
                    "reps": reps,
                    "rest_s": rest_s,
                }
            )

        workout_days.append(
            {"day": day_name, "exercises": day_exercises, "focus": primary_group}
        )

    return {"level": difficulty, "days": workout_days}


@app.post("/ml/generate_plan")
def generate_plan(req: GeneratePlanRequest):
    profile = req.profile

    # 1) Predict calories either with model or Mifflin fallback
    if model is None:
        sex = 1 if profile.sex == "male" else 0
        age = profile.age
        weight = profile.weight_kg or 70
        height = profile.height_cm or 170
        if profile.sex == "male":
            bmr = 10 * weight + 6.25 * height - 5 * age + 5
        else:
            bmr = 10 * weight + 6.25 * height - 5 * age - 161
        factor = [1.2, 1.375, 1.55, 1.725, 1.9][activity_map.get(profile.activity_level, 1)]
        calorie_est = int(bmr * factor)
    else:
        sex = 1 if profile.sex == "male" else 0
        activity = activity_map.get(profile.activity_level, 1)
        goal_idx = goal_map.get(profile.goal, 1)
        feat = np.array(
            [[profile.age, sex, profile.height_cm, profile.weight_kg, activity, goal_idx]]
        )
        calorie_est = int(model.predict(feat)[0])

    # 2) Macros
    macros = macro_split(calorie_est, profile.goal, profile.weight_kg)

    # 3) Meals using DB foods
    if not req.available_foods:
        meals: list[dict] = []
    else:
        meals = generate_meals_by_macro(calorie_est, req.available_foods, macros)

    # 4) Workout using DB exercises
    if not req.available_exercises:
        workout = {"level": "None", "days": []}
    else:
        workout = generate_workout(profile.goal, profile.activity_level, req.available_exercises)

    return {
        "calorie_estimate": calorie_est,
        "macros": macros,
        "meals": meals,
        "workout": workout,
    }
