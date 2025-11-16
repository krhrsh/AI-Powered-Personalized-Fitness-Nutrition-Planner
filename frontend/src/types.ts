export interface UserProfile {
  name: string;
  dob: string;
  sex: string;
  height_cm: number;
  weight_kg: number;
  activity_level: string;
  goal: string;
  diet_pref: string[];
  allergies: string[];
  weight_log?: { date: string; weight: number }[];
}

export interface PlanMealItem {
  name: string;
  cal: number;
  qty: string;
}

export interface PlanMeal {
  meal_type: string;
  items: PlanMealItem[];
}

export interface PlanWorkoutExercise {
  name: string;
  sets: number;
  reps: number;
}

export interface PlanWorkoutDay {
  day: string;
  exercises: PlanWorkoutExercise[];
}

export interface Plan {
  _id: string;
  user_id?: string;
  type?: string;
  start_date: string;
  end_date?: string;
  calorie_target: number;
  macros: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  meals: PlanMeal[];
  workout: {
    days: PlanWorkoutDay[];
  };
  created_at?: string;
}
