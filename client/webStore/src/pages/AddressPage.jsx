import React, { useState, useEffect } from "react";
import axios from "../api";
import { ToastContainer, toast } from "react-toastify";

export default function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await axios.get("/users/addresses");
      setAddresses(res.data.data || []);
    } catch (error) {
      console.error("Error loading addresses:", error);
      toast.error("Failed to load addresses");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      isDefault: false,
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEdit = (address) => {
    setEditingAddress(address._id);
    setFormData({
      name: address.name || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      phone: address.phone || "",
      isDefault: address.isDefault || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/users/addresses/${addressId}`);
      toast.success("Address deleted successfully");
      loadAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.line1) {
      toast.error("Address line 1 is required");
      return;
    }

    try {
      setLoading(true);
      if (editingAddress) {
        await axios.put(`/users/addresses/${editingAddress}`, { address: formData });
        toast.success("Address updated successfully");
      } else {
        await axios.post("/users/addresses", { address: formData });
        toast.success("Address added successfully");
      }
      resetForm();
      loadAddresses();
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error(editingAddress ? "Failed to update address" : "Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>My Addresses</h3>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add New Address
        </button>
      </div>
 
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>{editingAddress ? "Edit Address" : "Add New Address"}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <label className="form-label">Address Line 1</label>
                  <input
                    type="text"
                    name="line1"
                    className="form-control"
                    value={formData.line1}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <label className="form-label">Address Line 2</label>
                  <input
                    type="text"
                    name="line2"
                    className="form-control"
                    value={formData.line2}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    className="form-control"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="isDefault"
                      className="form-check-input"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">Set as default address</label>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
 
      {addresses.length === 0 && !showForm ? (
        <div className="alert alert-info">
          No addresses saved. Click "Add New Address" to add one.
        </div>
      ) : (
        <div className="row">
          {addresses.map((address) => (
            <div key={address._id} className="col-md-6 col-lg-4 mb-3">
              <div className={`card h-100 ${address.isDefault ? "border-primary" : ""}`}>
                <div className="card-body">
                  {address.isDefault && (
                    <span className="badge bg-primary mb-2">Default</span>
                  )}
                  <h6 className="card-title">{address.name}</h6>
                  <p className="card-text small mb-1">
                    <strong>Phone:</strong> {address.phone}
                  </p>
                  <p className="card-text small mb-1">
                    {address.line1}
                    {address.line2 && <>, {address.line2}</>}
                  </p>
                  <p className="card-text small mb-1">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
                <div className="card-footer bg-transparent">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(address)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(address._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
