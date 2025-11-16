export interface UserProfile {
  _id?: string;
  name?: string;
  email?: string;
  dob?: string;
  sex?: string;
  height_cm?: number;
  weight_kg?: number;
  activity_level?: string;
  goal?: string;
  diet_pref?: string[];
  allergies?: string[];
  weight_log?: { date: string; weight: number }[];
}

export interface Plan {
  _id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  calorie_target: number;
  macros: { protein_g: number; carbs_g: number; fat_g: number };
  meals: any[];
  workout: any;
}
