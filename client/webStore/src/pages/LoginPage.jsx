import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api";
import { ToastContainer, toast } from 'react-toastify'; 

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/users/login", {
        email,
        password,
      });

      const data = res.data?.data || res.data;

      if (!data || !data.token || !data.role) {
        throw new Error("Invalid response from server");
      }

      const { token, role, userData } = data;

      if (role !== "customer") {
        throw new Error("Please login with a customer account");
      }

      login(token, role, userData || { email, id: data.id });
      toast.success("Login successful");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
        padding: "20px",
      }}
    >
      <ToastContainer />
      <div className="col-12 col-md-6 col-lg-4">
        <div
          className="card shadow"
          style={{
            borderRadius: "15px",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="card-body p-4">
            <h3 className="card-title mb-4 text-center">Login</h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <button
                className="btn btn-primary w-100"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="mb-2">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary fw-semibold">
                  Sign Up
                </Link>
              </p>
              <Link to="/" className="text-muted small">
                Continue Shopping
              </Link>
            </div>

            {error && (
              <div className="alert alert-danger mt-3" role="alert">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
