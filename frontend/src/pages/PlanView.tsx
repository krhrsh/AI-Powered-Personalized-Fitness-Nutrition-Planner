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
        <h3 className="card-title">Meals (Calorie & Macro Breakdown)</h3>
        {plan.meals.map((m: any, idx: number) => (
          <div key={idx} className="border-b py-2">
            <h4 className="font-medium capitalize">{m.meal_type}</h4>
            <ul className="list-disc ml-5 text-sm text-slate-700">
              {m.items.map((it: any, i: number) => (
                <li key={i}>
                  <span className="font-medium">{it.name}</span> ({it.qty}) — {it.cal}{" "}
                  kcal
                  <span className="ml-3 text-xs text-slate-500">
                    P: {it.protein_g?.toFixed ? it.protein_g.toFixed(1) : it.protein_g || 0}g, C: {it.carbs_g?.toFixed ? it.carbs_g.toFixed(1) : it.carbs_g || 0}g, F:{" "}
                    {it.fat_g?.toFixed ? it.fat_g.toFixed(1) : it.fat_g || 0}g
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h3 className="card-title">
          Workout — Level: {plan.workout.level || "N/A"}
        </h3>
        {plan.workout.days.map((d: any, idx: number) => (
          <div key={idx} className="border-b py-2">
            <h4 className="font-medium">
              {d.day} {d.focus ? `(Focus: ${d.focus})` : ""}
            </h4>
            <ul className="list-disc ml-5 text-sm">
              {d.exercises.map((ex: any, i: number) => (
                <li key={i}>
                  {ex.name} — {ex.sets} x {ex.reps} (Rest: {ex.rest_s || 0}s)
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
