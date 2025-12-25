import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="h3 h-md-2 mb-2 mb-md-3">Welcome, Admin!</h2>
      <p className="d-none d-md-block mb-3">Select a task from the sidebar.</p>

      <div className="row g-3 mt-2 mt-md-4">
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card text-center shadow h-100" style={{ cursor: "pointer" }} onClick={() => navigate("/admin/store")}>
            <div className="card-body p-3 p-md-4">
              <h5 className="card-title h6 h-md-5 mb-2">Create Store</h5>
              <p className="text-muted small mb-0">Setup your store</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <div className="card text-center shadow h-100" style={{ cursor: "pointer" }} onClick={() => navigate("/admin/category")}>
            <div className="card-body p-3 p-md-4">
              <h5 className="card-title h6 h-md-5 mb-2">Categories</h5>
              <p className="text-muted small mb-0">Organize products</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <div className="card text-center shadow h-100" style={{ cursor: "pointer" }} onClick={() => navigate("/admin/products")}>
            <div className="card-body p-3 p-md-4">
              <h5 className="card-title h6 h-md-5 mb-2">Products</h5>
              <p className="text-muted small mb-0">Manage all your products</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <div className="card text-center shadow h-100" style={{ cursor: "pointer" }} onClick={() => navigate("/admin/orders")}>
            <div className="card-body p-3 p-md-4">
              <h5 className="card-title h6 h-md-5 mb-2">Orders</h5>
              <p className="text-muted small mb-0">Assign delivery partners</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <div className="card text-center shadow h-100" style={{ cursor: "pointer" }} onClick={() => navigate("/admin/delivery-partners")}>
            <div className="card-body p-3 p-md-4">
              <h5 className="card-title h6 h-md-5 mb-2">Delivery Partners</h5>
              <p className="text-muted small mb-0">Manage delivery partners</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
