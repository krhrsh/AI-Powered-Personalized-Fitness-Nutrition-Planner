function mifflinBmr({ sex, weightKg, heightCm, age }) {
  if (sex === "male") return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

const activityFactor = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

function estimateTDEE(profile) {
  const bmr = mifflinBmr({
    sex: profile.sex,
    weightKg: profile.weight_kg,
    heightCm: profile.height_cm,
    age: profile.age || 30,
  });
  const factor = activityFactor[profile.activity_level] || 1.2;
  return Math.round(bmr * factor);
}

module.exports = { estimateTDEE };
