import type React from "react";
import { useState } from "react";
import API from "../utils/api";
import { saveToken } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const res = await API.post("/api/auth/login", { email, password });
      saveToken(res.data.token);
      nav("/onboarding");
    } catch (error: any) {
      setErr(error.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4">
      <form
        className="w-full max-w-md card bg-white/90 backdrop-blur p-8 space-y-6"
        onSubmit={submit}
      >
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome back</h2>
          <p className="text-sm text-slate-500">
            Sign in to continue tracking your fitness and nutrition.
          </p>
        </div>
        {err && (
          <div className="bg-red-50 text-red-700 border border-red-100 px-3 py-2 rounded-md text-sm">
            {err}
          </div>
        )}
        <div className="space-y-3">
          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          className="w-full btn-primary"
          type="submit"
        >
          Login
        </button>
        <p className="mt-1 text-sm text-slate-600 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
