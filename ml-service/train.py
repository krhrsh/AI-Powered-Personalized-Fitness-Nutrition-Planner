import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
import os

MODEL_DIR = 'models'
os.makedirs(MODEL_DIR, exist_ok=True)

# generate synthetic dataset for calorie adjustment
# features: age, sex_male(0/1), height_cm, weight_kg, activity_level (0-4), goal(0-2)
# target: observed_calorie (true TDEE +/- noise)

np.random.seed(42)
N = 2000
age = np.random.randint(18, 60, N)
sex = np.random.randint(0,2,N)  # 1 male, 0 female
height = np.random.randint(150, 195, N)
weight = np.random.randint(50, 110, N)
activity = np.random.randint(0,5,N) # 0 sedentary .. 4 extra
goal = np.random.randint(0,3,N) # 0 lose,1 maintain,2 gain

# baseline BMR-like proxy
bmr = 10*weight + 6.25*height - 5*age + (5*sex - 161*(1-sex))
activity_factors = np.array([1.2,1.375,1.55,1.725,1.9])
true_tdee = bmr * activity_factors[activity]

# add goal-based adjustment: lose => -400, maintain 0, gain +400
goal_adj = np.where(goal==0, -400, np.where(goal==2, 400, 0))
true_tdee = true_tdee + goal_adj

# observed calories include noise
observed = true_tdee + np.random.normal(0, 120, size=N)

df = pd.DataFrame({
    'age': age,
    'sex': sex,
    'height_cm': height,
    'weight_kg': weight,
    'activity': activity,
    'goal': goal,
    'calories': observed
})

X = df[['age','sex','height_cm','weight_kg','activity','goal']]
y = df['calories']

X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.2,random_state=42)

model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

pred = model.predict(X_test)
mae = mean_absolute_error(y_test, pred)
print('MAE on synthetic test:', mae)

# save model
joblib.dump(model, os.path.join(MODEL_DIR, 'calorie_regressor.joblib'))
print('Saved model to', os.path.join(MODEL_DIR, 'calorie_regressor.joblib'))
