from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import os

MODEL_PATH = os.environ.get('MODEL_PATH', 'models/calorie_regressor.joblib')
# load model if available (handle missing model gracefully)
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
else:
    model = None

app = FastAPI(title="AI Fitness ML Service")

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
    history: History = None
    plan_type: str = 'weekly'

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

def macro_split(calories, goal, weight_kg):
    if goal == 'gain':
        protein_per_kg = 1.8
    elif goal == 'lose':
        protein_per_kg = 1.4
    else:
        protein_per_kg = 1.6

    protein_g = int(protein_per_kg * (weight_kg or 70))
    protein_kcal = protein_g * 4
    fat_kcal = int(0.25 * calories)
    fat_g = int(fat_kcal / 9)
    carbs_kcal = calories - protein_kcal - fat_kcal
    carbs_g = int(carbs_kcal / 4) if carbs_kcal > 0 else 0
    return {'protein_g': protein_g, 'carbs_g': carbs_g, 'fat_g': fat_g}

SAMPLE_FOODS = [
    {'food_id': 'f1', 'name': 'Oats (50g)', 'cal': 190, 'protein_g': 6.5},
    {'food_id': 'f2', 'name': 'Boiled Egg (1)', 'cal': 78, 'protein_g': 6.3},
    {'food_id': 'f3', 'name': 'Grilled Chicken (100g)', 'cal': 165, 'protein_g': 31},
    {'food_id': 'f4', 'name': 'Brown Rice (100g)', 'cal': 111, 'protein_g': 2.6},
    {'food_id': 'f5', 'name': 'Greek Yogurt (150g)', 'cal': 120, 'protein_g': 10}
]

WORKOUT_TEMPLATES = {
    'beginner': [
        {'day': 'Mon', 'exercises': [{'name':'Squat','sets':3,'reps':'8-10'},{'name':'Push-up','sets':3,'reps':'10-12'}]},
        {'day': 'Wed', 'exercises': [{'name':'Lunge','sets':3,'reps':'10'},{'name':'Plank','sets':3,'reps':'45s'}]},
        {'day': 'Fri', 'exercises': [{'name':'Deadlift (light)','sets':3,'reps':'6-8'},{'name':'Rows','sets':3,'reps':'8-10'}]}
    ],
    'intermediate': [
        {'day':'Mon','exercises':[{'name':'Squat','sets':4,'reps':'6-8'},{'name':'Bench Press','sets':4,'reps':'6-8'}]},
        {'day':'Tue','exercises':[{'name':'Pull-ups','sets':4,'reps':'6-8'},{'name':'Deadlift','sets':3,'reps':'5-6'}]}
    ]
}

@app.post('/ml/generate_plan')
def generate_plan(req: GeneratePlanRequest):
    profile = req.profile
    if model is None:
        # fallback to a simple TDEE calculation (Mifflin) if model missing
        sex = 1 if profile.sex == 'male' else 0
        age = profile.age
        weight = profile.weight_kg or 70
        height = profile.height_cm or 170
        if profile.sex == 'male':
            bmr = 10*weight + 6.25*height - 5*age + 5
        else:
            bmr = 10*weight + 6.25*height - 5*age - 161
        factor = [1.2,1.375,1.55,1.725,1.9][ activity_map.get(profile.activity_level,1) ]
        calorie_est = int(bmr * factor)
    else:
        sex = 1 if profile.sex == 'male' else 0
        activity = activity_map.get(profile.activity_level, 1)
        goal = goal_map.get(profile.goal, 1)
        feat = np.array([[profile.age, sex, profile.height_cm, profile.weight_kg, activity, goal]])
        calorie_est = int(model.predict(feat)[0])

    macros = macro_split(calorie_est, profile.goal, profile.weight_kg)
    meals = []
    per_meal_cal = int(calorie_est / 3)
    for meal_type in ['breakfast','lunch','dinner']:
        items = []
        remaining = per_meal_cal
        for f in SAMPLE_FOODS:
            if remaining <= 0:
                break
            if f['cal'] <= remaining:
                items.append({'food_id': f['food_id'], 'name': f['name'], 'cal': f['cal'], 'qty': '1 serving'})
                remaining -= f['cal']
        if not items:
            items.append({'food_id': SAMPLE_FOODS[0]['food_id'], 'name': SAMPLE_FOODS[0]['name'], 'cal': SAMPLE_FOODS[0]['cal'], 'qty':'1 serving'})
        meals.append({'meal_type': meal_type, 'items': items})

    level = 'beginner' if profile.activity_level in ['sedentary','lightly_active'] else 'intermediate'
    workout = {'level': level, 'days': WORKOUT_TEMPLATES[level]}

    return {
        'calorie_estimate': calorie_est,
        'macros': macros,
        'meals': meals,
        'workout': workout
    }
