import { useEffect, useState } from "react";
import API from "../utils/api";
import { logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import GeneratePlanButton from "../components/GeneratePlanButton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { UserProfile, Plan } from "../types";

export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [weightLog, setWeightLog] = useState<
    { date: string; weight: number }[]
  >([]);
  const [lastPlan, setLastPlan] = useState<Plan | null>(null);
  const [latestPlans, setLatestPlans] = useState<Plan[]>([]);
  const [newWeight, setNewWeight] = useState<string>("");
  const [newWeightDate, setNewWeightDate] = useState<string>("");
  const nav = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData(): Promise<void> {
    try {
      const res = await API.get("/api/users/me");
      setUser(res.data.user as UserProfile);
      const wl = (res.data.user.weight_log || []).map((w: any) => ({
        date: new Date(w.date).toLocaleDateString(),
        weight: w.weight,
      }));
      setWeightLog(wl);

      if (!newWeightDate) {
        const today = new Date().toISOString().split("T")[0];
        setNewWeightDate(today);
      }
    } catch (err) {
      // ignore
    }

    try {
      const plansRes = await API.get("/api/plans/me");
      const plans = (plansRes.data.plans || []) as Plan[];
      setLatestPlans(plans);
      setLastPlan(plans[0] ?? null);
    } catch {
      // ignore plan fetch errors for now
    }
  }

  async function addWeightEntry(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const value = parseFloat(newWeight);
    if (!value || value <= 0 || !newWeightDate) return;
    try {
      const res = await API.post("/api/users/me/weight", {
        weight: value,
        date: newWeightDate,
      });
      const wl = (res.data.weight_log || []).map((w: any) => ({
        date: new Date(w.date).toLocaleDateString(),
        weight: w.weight,
      }));
      setWeightLog(wl);
      setNewWeight("");
    } catch {
      // ignore errors for now
    }
  }

  function doLogout(): void {
    logout();
    nav("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Dashboard{user ? ` - ${user.name}` : ""}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Overview of your recent progress and plans.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => nav("/onboarding")}
              className="px-3 py-2 border rounded text-sm"
            >
              Profile
            </button>
            <button
              onClick={doLogout}
              className="px-3 py-2 border rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 card p-4">
            <div className="card-header">
              <h3 className="card-title">Progress</h3>
              {weightLog.length > 1 && (
                <span className="badge-soft">{weightLog.length} entries</span>
              )}
            </div>
            {weightLog.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weightLog}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">No weight logs yet</p>
            )}

            <form
              onSubmit={addWeightEntry}
              className="mt-4 flex flex-wrap items-center gap-2 text-sm"
            >
              <label className="flex items-center gap-1">
                <span className="text-gray-600">Date</span>
                <input
                  type="date"
                  value={newWeightDate}
                  onChange={(e) => setNewWeightDate(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
              </label>
              <label className="flex items-center gap-1">
                <span className="text-gray-600">Weight (kg)</span>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="border px-2 py-1 rounded w-24"
                />
              </label>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 text-white rounded"
              >
                Add entry
              </button>
            </form>
          </div>

          <div className="card p-4">
            <h3 className="card-title">Quick Actions</h3>
            <div className="mt-3 flex flex-col gap-3">
              <GeneratePlanButton />
              <button
                type="button"
                disabled={!lastPlan}
                onClick={() => lastPlan && nav(`/plans/${lastPlan._id}`)}
                className={`text-left text-indigo-600 disabled:text-gray-400 disabled:cursor-not-allowed text-sm`}
              >
                {lastPlan ? "View last plan" : "No plans yet"}
              </button>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="card-title">Latest Plans</h3>
          {latestPlans.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {latestPlans.map((p) => (
                <li
                  key={p._id}
                  className="flex items-center justify-between border-b last:border-b-0 pb-2"
                >
                  <div>
                    <div className="font-medium">
                      {new Date(p.start_date).toLocaleDateString()}
                    </div>
                    <div className="text-gray-500">
                      {p.calorie_target} kcal{p.type ? ` · ${p.type}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => nav(`/plans/${p._id}`)}
                    className="text-indigo-600"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              Generated plans will appear here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
