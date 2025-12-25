// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiPost } from "../api/api";


// export default function RegisterPage() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     role: "customer",
//     email: "",
//     password: "",
//   });

//   const [msg, setMsg] = useState("");
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(false);

//   const isAdmin = form.role === "admin";
//   const isCustomer = form.role === "customer";
//   const isSuperAdmin = form.role === "super_admin";

//   const onChange = (e) => {
//     setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setMsg("");
//     setErr("");
//     setLoading(true);

//     try {
//       let endpoint = "";
//       let payload = {};

//       if (form.role === "super_admin") {
//         endpoint = "/users/superAdmin";
//         payload = {
//           email: form.email,
//           password: form.password,
//           mobileNo: form.mobileNo,
//         };
//       } else if (form.role === "admin") {
//         endpoint = "/users/admin";
//         payload = {
//           email: form.email,
//           password: form.password,
//         };
//       } else {
//         endpoint = "/users/customer";
//         payload = {
//           email: form.email,
//           password: form.password,
//           mobileNo: form.mobileNo,
//         };
//       }

//       const res = await apiPost(endpoint, payload);

//       setMsg("Registered successfully. Please login to continue.");

//       setTimeout(() => {
//         navigate("/login");
//       }, 2000);
//     } catch (error) {
//       setErr(error.message);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="container mt-4">
//       <div className="card shadow p-4 mx-auto" style={{ maxWidth: "650px" }}>
//         <h3 className="text-center mb-3">Signup</h3>

//         <div className="mb-3">
//           <label className="form-label">Select Role</label>
//           <select
//             name="role"
//             value={form.role}
//             onChange={onChange}
//             className="form-select"
//           >
//             <option value="super_admin">Super Admin</option>
//             <option value="admin">Admin (Store Owner)</option>
//             <option value="customer">Customer</option>
//           </select>
//         </div>

//         <form onSubmit={onSubmit}>
//           <div className="mb-3">
//             <label className="form-label">Email</label>
//             <input
//               name="email"
//               className="form-control"
//               type="email"
//               onChange={onChange}
//               value={form.email}
//               required
//             />
//           </div>

//           <div className="mb-3">
//             <label className="form-label">Password</label>
//             <input
//               name="password"
//               className="form-control"
//               type="password"
//               onChange={onChange}
//               value={form.password}
//               required
//             />
//           </div>

//           {(isCustomer || isSuperAdmin) && (
//             <div className="mb-3">
//               <label className="form-label">Mobile No</label>
//               <input
//                 name="mobileNo"
//                 className="form-control"
//                 type="text"
//                 onChange={onChange}
//                 value={form.mobileNo}
//                 required
//               />
//             </div>
//           )}

//           <button className="btn btn-primary w-100" disabled={loading}>
//             {loading ? "Submitting..." : "Signup"}
//           </button>

//           {msg && <p className="text-success mt-3">{msg}</p>}
//           {err && <p className="text-danger mt-3">{err}</p>}
//         </form>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api/api";


export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    role: "customer",
    email: "",
    password: "",
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = form.role === "admin";
  const isCustomer = form.role === "customer";
  const isSuperAdmin = form.role === "super_admin";

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      let endpoint = "";
      let payload = {};

      if (form.role === "super_admin") {
        endpoint = "/users/superAdmin";
        payload = {
          email: form.email,
          password: form.password,
          mobileNo: form.mobileNo,
        };
      } else if (form.role === "admin") {
        endpoint = "/users/admin";
        payload = {
          email: form.email,
          password: form.password,
        };
      } else {
        endpoint = "/users/customer";
        payload = {
          email: form.email,
          password: form.password,
          mobileNo: form.mobileNo,
        };
      }

      const res = await apiPost(endpoint, payload);

      setMsg("Registered successfully. Please login to continue.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErr(error.message);
    }

    setLoading(false);
  };

 return (
  <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4 px-3" style={{ background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)"}}>
    <div
      className="card shadow-lg border-0 w-100"
      style={{ maxWidth: "520px" }}
    >
      <div className="card-body p-4 p-md-5">

        <h3 className="text-center fw-bold mb-2">Create Account</h3>
        <p className="text-center text-muted mb-4">
          Sign up to get started
        </p>

        <div className="mb-3">
          <label className="form-label fw-semibold small">
            Select Role
          </label>
          <select
            name="role"
            value={form.role}
            onChange={onChange}
            className="form-select form-select-lg"
          >
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin (Store Owner)</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Email</label>
            <input
              name="email"
              className="form-control form-control-lg"
              type="email"
              onChange={onChange}
              value={form.email}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Password</label>
            <input
              name="password"
              className="form-control form-control-lg"
              type="password"
              onChange={onChange}
              value={form.password}
              required
              placeholder="Create a password"
            />
          </div>

          {(isCustomer || isSuperAdmin) && (
            <div className="mb-4">
              <label className="form-label fw-semibold small">
                Mobile Number
              </label>
              <input
                name="mobileNo"
                className="form-control form-control-lg"
                type="text"
                onChange={onChange}
                value={form.mobileNo}
                required
                placeholder="Enter mobile number"
              />
            </div>
          )}

          <button
            className="btn btn-primary btn-lg w-100"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Signup"}
          </button>

          <div className="text-center mt-4">
            <span className="text-muted small">
              Already have an account?
            </span>
            <button
              type="button"
              className="btn btn-link fw-semibold text-decoration-none ms-1 p-0"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>

          {msg && (
            <div className="alert alert-success mt-3 mb-0">
              {msg}
            </div>
          )}

          {err && (
            <div className="alert alert-danger mt-3 mb-0">
              {err}
            </div>
          )}
        </form>
      </div>
    </div>
  </div>
);

}





