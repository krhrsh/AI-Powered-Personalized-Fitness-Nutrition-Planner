import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../utils/api";
import type { Plan } from "../types";

export default function PlanView() {
  const { id } = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (id) {
      void fetchPlan();
    }
  }, [id]);

  async function fetchPlan(): Promise<void> {
    try {
      const res = await API.get(`/api/plans/${id}`);
      setPlan(res.data.plan as Plan);
    } catch (err) {
      // ignore
    }
  }

  if (!plan)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-slate-500">Loading plan…</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-3 text-slate-900">
          Plan — {new Date(plan.start_date).toLocaleDateString()}
        </h2>
        <div className="card p-4 mb-4">
          <h3 className="card-title">
            Calories: {plan.calorie_target} kcal
          </h3>
        <p>
          Macros — Protein: {plan.macros.protein_g}g, Carbs:{" "}
          {plan.macros.carbs_g}g, Fat: {plan.macros.fat_g}g
        </p>
      </div>

        <div className="card p-4 mb-4">
          <h3 className="card-title">Meals</h3>
        {plan.meals.map((m, idx) => (
          <div key={idx} className="border-b py-2">
            <h4 className="font-medium">{m.meal_type}</h4>
            <ul className="list-disc ml-5">
              {m.items.map((it: any, i: number) => (
                <li key={i}>
                  {it.name} — {it.cal} kcal — {it.qty}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

        <div className="card p-4">
          <h3 className="card-title">Workout</h3>
        {plan.workout.days.map((d: any, idx: number) => (
          <div key={idx} className="border-b py-2">
            <h4 className="font-medium">{d.day}</h4>
            <ul className="list-disc ml-5">
              {d.exercises.map((ex: any, i: number) => (
                <li key={i}>
                  {ex.name} — {ex.sets} x {ex.reps}
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
