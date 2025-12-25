import { Link, useLocation } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { useEffect } from "react";

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", icon: "bi-speedometer2", to: "/admin/dashboard" },
    { label: "Store", icon: "bi-shop", to: "/admin/store" },
    { label: "Category", icon: "bi-tags", to: "/admin/category" },
    { label: "Product List", icon: "bi-box-seam", to: "/admin/products" },
    { label: "Orders", icon: "bi-bag-check", to: "/admin/orders" },
    { label: "Delivery Partners", icon: "bi-truck", to: "/admin/delivery-partners" },
  ];
 
  const closeSidebar = () => {
    setSidebarOpen(false);
  };
 
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setSidebarOpen(true);  
      } else {
        setSidebarOpen(false);
      }
    };
 
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  return (
    <>
 
      {sidebarOpen && (
        <div 
          className="d-lg-none" 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999
          }}
          onClick={closeSidebar}
        />
      )}

      <div
        className={`p-3 text-white d-flex flex-column`}
        style={{
          width: "260px",
          minHeight: "100vh",
          background: "#0d1117",
          borderRight: "1px solid #222",
          position: "fixed",
          zIndex: 1000,
          transition: "transform 0.3s ease-in-out",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          boxShadow: "2px 0 5px rgba(0,0,0,0.2)"
        }}
      >
 
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0 fw-bold">Admin Panel</h4>
          <button 
            className="btn btn-light d-lg-none"
            onClick={closeSidebar}
            style={{ width: 30, height: 30, padding: 0 }}
          >
            <FiX size={20} />
          </button>
        </div>

        <ul className="nav flex-column">
          {menuItems.map((item) => {
            const active = location.pathname === item.to;

            return (
              <li key={item.to} className="nav-item mb-2">
                <Link
                  className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                    active ? "active-link" : "text-white"
                  }`}
                  to={item.to}
                  style={{ transition: "0.2s" }}
                  onClick={() => window.innerWidth < 992 && closeSidebar()}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

  
        <style>
          {`
            .nav-link {
              font-size: 15px;
              opacity: 0.85;
            }
            .nav-link:hover {
              opacity: 1;
              background: rgba(255,255,255,0.1);
              transform: translateX(4px);
            }
            .active-link {
              background: #1f6feb !important;
              color: white !important;
              font-weight: 600;
              opacity: 1;
            }
          `}
        </style>
      </div>
    </>
  );
}