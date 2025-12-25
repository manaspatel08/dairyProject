import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
    
    const handleResize = () => {
      const desktop = window.innerWidth >= 992;
      setIsDesktop(desktop);
      if (desktop) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize();  
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div 
        className="flex-grow-1"
        style={{ 
          marginLeft: sidebarOpen && isDesktop ? "260px" : "0",
          transition: "margin-left 0.3s ease-in-out",
          width: sidebarOpen && isDesktop ? "calc(100% - 260px)" : "100%"
        }}
      >
        <AdminTopbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="p-2 p-md-3 p-lg-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}