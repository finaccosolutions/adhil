import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Lock, User, AlertCircle } from "lucide-react";

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check if user ID exists in admin_roles table
      const { data: adminRole, error: adminError } = await supabase
        .from("admin_roles")
        .select("user_id, is_admin")
        .eq("user_id", userId.trim())
        .eq("is_admin", true)
        .maybeSingle();

      if (adminError) {
        throw new Error("Error checking admin status");
      }

      if (!adminRole) {
        setError("Invalid user ID or you are not an admin");
        setLoading(false);
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId.trim())
        .maybeSingle();

      if (profileError || !profile) {
        setError("User profile not found");
        setLoading(false);
        return;
      }

      // Store admin session in localStorage
      localStorage.setItem("admin_user", JSON.stringify({
        user_id: profile.id,
        username: profile.username,
        is_admin: true
      }));

      // Navigate to admin dashboard
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h2>
          <p className="text-gray-600">Enter your admin user ID to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              Admin User ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your UUID"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter your admin user ID (UUID format)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
