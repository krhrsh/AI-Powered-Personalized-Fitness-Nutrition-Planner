import { useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function GeneratePlanButton() {
  const [loading, setLoading] = useState<boolean>(false);
  const nav = useNavigate();

  async function generate(): Promise<void> {
    setLoading(true);
    try {
      const res = await API.post("/api/plans/generate", {
        plan_type: "weekly",
      });
      setLoading(false);
      const planId = res.data.plan._id as string;
      nav(`/plans/${planId}`);
    } catch (err) {
      setLoading(false);
      alert("Failed to generate plan");
    }
  }

  return (
    <button
      onClick={generate}
      className="px-4 py-2 bg-indigo-600 text-white rounded"
    >
      {loading ? "Generating..." : "Generate Plan"}
    </button>
  );
}
