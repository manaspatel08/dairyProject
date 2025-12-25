import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { FiMenu, FiX } from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminTopbar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);

  const panelRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Failed to load profile");
        }

        setProfile(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 576);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <nav className="navbar navbar-light bg-light px-2 px-md-3 px-lg-4 shadow-sm d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center">
        <button 
          className="btn me-2 d-lg-none"
          onClick={toggleSidebar}
          style={{ width: 40, height: 40, padding: 0 }}
          aria-label="Toggle sidebar"
        >
          <FiMenu size={20} />
        </button>
        
        <span className="navbar-brand h5 h-md-4 mb-0 d-none d-sm-block">Admin Dashboard</span>
        <span className="navbar-brand h6 mb-0 d-sm-none">Admin</span>
      </div>

      <div className="d-flex align-items-center" style={{ gap: "8px" }}>
        <div ref={panelRef} style={{ position: "relative" }}>
      <CgProfile size={24} onClick={() => setShowProfile((prev) => !prev)} />
          {showProfile && (
            <div
              className="card"
              style={{
                position: "absolute",
                right: 0,
                top: "50px",
                width: isMobile ? "280px" : "300px",
                maxWidth: "90vw",
                zIndex: 2000,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <div className="card-body p-3">
                <h5 className="card-title mb-3" style={{ fontSize: "1rem" }}>Profile</h5>

                {loading ? (
                  <p className="mb-0 small">Loading...</p>
                ) : error ? (
                  <div className="alert alert-danger py-2 mb-2 small">{error}</div>
                ) : (
                  <>
                    <p className="mb-2 small">
                      <strong>Email:</strong> <span className="text-break">{profile?.email}</span>
                    </p>
                    <p className="mb-2 small">
                      <strong>Role:</strong> {profile?.role}
                    </p>
                    {/* <p className="mb-3 small">
                      <strong>Total Stores:</strong> {profile?.storeCount || 1}
                    </p> */}

                    <button className="btn btn-outline-danger w-25 mt-3 btn-sm" onClick={logout}>
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}