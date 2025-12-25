import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api";
import { ToastContainer, toast } from "react-toastify";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    mobileNo: "",
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      const res = await axios.post("/users/customer", {
        email: form.email,
        password: form.password,
        mobileNo: form.mobileNo,
      });

      toast.success("Registered successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          error.message ||
          "Registration failed. Please try again."
      );
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
            <h3 className="card-title mb-4 text-center">Create Account</h3>

            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  className="form-control"
                  type="email"
                  onChange={onChange}
                  value={form.email}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  name="password"
                  className="form-control"
                  type="password"
                  onChange={onChange}
                  value={form.password}
                  required
                  placeholder="Enter your password"
                  minLength="8"
                />
                <small className="text-muted ">
                  Password must be at least 8 characters
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label">Mobile Number</label>
                <input
                  name="mobileNo"
                  className="form-control"
                  type="tel"
                  onChange={onChange}
                  value={form.mobileNo}
                  required
                  placeholder="Enter your mobile number"
                />
              </div>

              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="mb-2">
                Already have an account?{" "}
                <Link to="/login" className="text-primary fw-semibold">
                  Login
                </Link>
              </p>
              <Link to="/" className="text-muted small">
                Continue Shopping
              </Link>
            </div>

            {msg && <div className="alert alert-success mt-3">{msg}</div>}
            {err && <div className="alert alert-danger mt-3">{err}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
