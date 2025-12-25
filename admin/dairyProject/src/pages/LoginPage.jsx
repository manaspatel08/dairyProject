// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// export default function LoginPage() {
//   const navigate = useNavigate();
  
//   const handleSignUpClick = () => {
//     navigate('/register'); 
//   };

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");
//     setError("");

//     try {
//       const res = await fetch(`${BASE_URL}/users/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Login failed");
//       }

    
//       const result = data.data;

//       if (!result || !result.token || !result.role) {
//         throw new Error("Token or role not returned by server");
//       }

//       const { token, role } = result;

//       localStorage.setItem("token", token);
//       localStorage.setItem("role", role);
//       localStorage.setItem('userData', JSON.stringify(result.userData));


//       if (role === "admin") {
//         try {
//           const storeRes = await fetch(`${BASE_URL}/stores/my-store`, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });

//           const storeJson = await storeRes.json();
//           if (storeRes.ok && storeJson.data?.store?._id) {
//             localStorage.setItem("storeId", storeJson.data.store._id);
//           }
//         } catch (err) {
//           console.log("Store not found for admin:", err);
//         }
//       }

//       setMessage(data.message || "Login successful");

//       if (role === "super_admin") {
//         navigate("/superadmin/dashboard");
//       } else if (role === "admin") {
//         navigate("/admin/dashboard");
//       } else if (role === "customer") {
//         navigate("/customer/home");
//       } else {
//         navigate("/");
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mt-5 " style={{ maxWidth: "450px" }}>
//       <div className="card shadow-sm">
//         <div className="card-body">
//           <h3 className="card-title mb-4 text-center">Login</h3>

//           <form onSubmit={handleSubmit}>
//             <div className="mb-3">
//               <label className="form-label">Email</label>
//               <input
//                 className="form-control"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 placeholder="enter your email"
//               />
//             </div>

//             <div className="mb-3">
//               <label className="form-label">Password</label>
//               <input
//                 className="form-control"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 placeholder="enter your password"
//               />
//             </div>

//             <button
//               className="btn btn-primary w-100"
//               type="submit"
//               disabled={loading}
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>

//           <div className="mt-4 d-flex align-item-center justify-content-end ">
//             <button className="btn btn-outline-success"  onClick={handleSignUpClick}>Sign Up</button>
//           </div>

//           {message && (
//             <div className="alert alert-success mt-3" role="alert">
//               {message}
//             </div>
//           )}
//           {error && (
//             <div className="alert alert-danger mt-3" role="alert">
//               {error}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const navigate = useNavigate();
  
  const handleSignUpClick = () => {
    navigate('/register'); 
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

    
      const result = data.data;

      if (!result || !result.token || !result.role) {
        throw new Error("Token or role not returned by server");
      }

      const { token, role } = result;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem('userData', JSON.stringify(result.userData));


      if (role === "admin") {
        try {
          const storeRes = await fetch(`${BASE_URL}/stores/my-store`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const storeJson = await storeRes.json();
          if (storeRes.ok && storeJson.data?.store?._id) {
            localStorage.setItem("storeId", storeJson.data.store._id);
          }
        } catch (err) {
          console.log("Store not found for admin:", err);
        }
        setMessage(data.message || "Login successful");
      }


      if (role === "super_admin") {
         setMessage( "only super_admin can login");
        //navigate("/superadmin/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "customer") {
             setMessage( "only admin can login");
        // navigate("/customer/home");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3" style={{ background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)"}}>
    <div className="card shadow-lg border-0 w-100" style={{ maxWidth: "420px"  }}>
      <div className="card-body p-4 p-md-5">

        <h3 className="text-center fw-bold mb-2">Welcome</h3>
        <p className="text-center text-muted mb-4">
          Login to your account
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Email</label>
            <input
              className="form-control form-control-lg"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold small">Password</label>
            <input
              className="form-control form-control-lg"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            className="btn btn-primary btn-lg w-100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted small">Don’t have an account?</span>
          <button
            className="btn btn-link fw-semibold text-decoration-none ms-1 p-0"
            onClick={handleSignUpClick}
          >
            Sign Up
          </button>
        </div>

        {message && (
          <div className="alert alert-success mt-3 mb-0" role="alert">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger mt-3 mb-0" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  </div>
);

}