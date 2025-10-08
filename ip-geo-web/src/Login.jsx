import React, { useState } from "react";
import axios from "axios";

export default function Login({ onLogin, api }) {
  const [email, setEmail] = useState("candidate@example.com");
  const [password, setPassword] = useState("Password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(api + "/api/login", { email, password });
      const { token, user } = res.data;
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      onLogin(token, user);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 p-4">
      {/* Centered login form */}
      <div className="w-full max-w-md bg-white/90 p-8 rounded-2xl shadow-2xl backdrop-blur-lg">
        <div className="text-center mb-6">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
            alt="Logo"
            className="w-16 h-16 mx-auto mb-3 animate-spin-slow"
          />
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back 👋</h2>
          <p className="text-gray-500 text-sm mt-1">
            Please sign in to continue
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-700 font-medium">
              Email
            </label>
            <input
              type="email"
              className="mt-1 p-3 border border-gray-300 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 font-medium">
              Password
            </label>
            <input
              type="password"
              className="mt-1 p-3 border border-gray-300 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:opacity-90 transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Demo Account: <strong>candidate@example.com</strong> /{" "}
          <strong>Password123</strong>
        </div>
      </div>
    </div>
  );
}
