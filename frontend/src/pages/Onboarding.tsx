import type React from "react";
import { useState, useEffect } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "../types";

export default function Onboarding() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    dob: "",
    sex: "male",
    height_cm: 175,
    weight_kg: 70,
    activity_level: "moderately_active",
    goal: "maintain",
    diet_pref: [],
    allergies: [],
  });
  const nav = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await API.get("/api/users/me");
        setProfile(res.data.user as UserProfile);
      } catch (e) {
        // ignore
      }
    }
    fetchProfile();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await API.put("/api/users/me", profile);
    nav("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-slate-900">
          Tell us about yourself
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          We use this information to personalize your calorie targets, meal plans,
          and workouts.
        </p>
        <form
          onSubmit={save}
          className="grid grid-cols-1 gap-4 card p-6 md:p-8"
        >
          <input
            value={profile.name || ""}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Full name"
            className="input"
          />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="date"
            value={profile.dob ? profile.dob.split("T")[0] : ""}
            onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
            className="input"
          />
          <select
            value={profile.sex}
            onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
            className="input"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="number"
            value={profile.height_cm || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                height_cm: parseInt(e.target.value, 10) || 0,
              })
            }
            className="input"
            placeholder="Height cm"
          />
          <input
            type="number"
            value={profile.weight_kg || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                weight_kg: parseInt(e.target.value, 10) || 0,
              })
            }
            className="input"
            placeholder="Weight kg"
          />
          <select
            value={profile.activity_level}
            onChange={(e) =>
              setProfile({ ...profile, activity_level: e.target.value })
            }
            className="input"
          >
            <option value="sedentary">Sedentary</option>
            <option value="lightly_active">Lightly active</option>
            <option value="moderately_active">Moderately active</option>
            <option value="very_active">Very active</option>
            <option value="extra_active">Extra active</option>
          </select>
        </div>

        <select
          value={profile.goal}
          onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
          className="input"
        >
          <option value="lose">Lose weight</option>
          <option value="maintain">Maintain</option>
          <option value="gain">Gain weight</option>
        </select>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            placeholder="Diet preferences (comma separated)"
            value={(profile.diet_pref || []).join(",")}
            onChange={(e) =>
              setProfile({
                ...profile,
                diet_pref: e.target.value.split(",").map((s) => s.trim()),
              })
            }
            className="input flex-1"
          />
          <input
            placeholder="Allergies (comma separated)"
            value={(profile.allergies || []).join(",")}
            onChange={(e) =>
              setProfile({
                ...profile,
                allergies: e.target.value.split(",").map((s) => s.trim()),
              })
            }
            className="input"
          />
        </div>

        <div className="flex justify-end">
          <button
            className="btn-primary px-5"
            type="submit"
          >
            Save & Continue
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
