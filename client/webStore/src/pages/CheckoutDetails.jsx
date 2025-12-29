import React, { useEffect, useState } from "react";
import api from "../api";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function CheckoutDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const subscriptions = location.state?.subscriptions || [];

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      loadAddresses();
    }
  }, [isAuthenticated]);

  const loadAddresses = async () => {
    try {
      const res = await api.get("/users/addresses");
      const addresses = res.data.data || [];
      setSavedAddresses(addresses);
 
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
        setUseNewAddress(false);
      } else if (addresses.length > 0) {
  
        setSelectedAddressId(addresses[0]._id);
        setUseNewAddress(false);
      } else {
  
        setUseNewAddress(true);
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
   
      setUseNewAddress(true);
    }
  };

  const handleProceed = async () => {
    let finalAddress = null;

    if (useNewAddress) {
 
      if (!newAddress.line1 || !newAddress.name || !newAddress.phone) {
        toast.error("Please fill all required address fields");
        return;
      }
      finalAddress = newAddress;
    } else {
 
      const selectedAddress = savedAddresses.find(
        addr => addr._id === selectedAddressId
      );
      if (!selectedAddress) {
        toast.error("Please select an address");
        return;
      }
      finalAddress = {
        name: selectedAddress.name,
        line1: selectedAddress.line1,
        line2: selectedAddress.line2,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        phone: selectedAddress.phone,
      };
    }

    try {
      setLoading(true);
      const res = await api.post("/payments/order", {
        address: finalAddress,
        subscriptions,
        useCart: true,
      });

      const data = res.data.data;

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        new window.Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: "INR",
          order_id: data.orderId,
          handler: async (resp) => {
            await api.post("/payments/verify", {
              ...resp,
              paymentRecordId: data.paymentRecordId,
            });
            // toast.success("Payment successful");
            // toast.success("Order Placed")
          toast.success("Order Placed Successfully ✅");

setTimeout(() => {
  navigate("/orders");
}, 1200);
          },
        }).open();
      };
      document.body.appendChild(script);
    } catch (e) {
      toast.error("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) return <div className="container mt-5">Please login</div>;

  return (
    <div className="container mt-5">
      <h3>Delivery Address</h3>
 
      {savedAddresses.length > 0 && (
        <div className="mb-4">
          <h5 className="mb-3">Saved Addresses</h5>
          <div className="row">
            {savedAddresses.map((address) => (
              <div key={address._id} className="col-md-6 col-lg-4 mb-3">
                <div
                  className={`card h-100 cursor-pointer ${
                    selectedAddressId === address._id && !useNewAddress
                      ? "border-primary shadow-sm"
                      : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedAddressId(address._id);
                    setUseNewAddress(false);
                  }}
                >
                  <div className="card-body">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="address"
                        checked={selectedAddressId === address._id && !useNewAddress}
                        onChange={() => {
                          setSelectedAddressId(address._id);
                          setUseNewAddress(false);
                        }}
                      />
                      <label className="form-check-label w-100">
                        {address.isDefault && (
                          <span className="badge bg-primary mb-2">Default</span>
                        )}
                        <h6 className="mt-2">{address.name}</h6>
                        <p className="small mb-1">
                          <strong>Phone:</strong> {address.phone}
                        </p>
                        <p className="small mb-1">
                          {address.line1}
                          {address.line2 && <>, {address.line2}</>}
                        </p>
                        <p className="small mb-0">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
 
      <div className="mb-4">
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="radio"
            name="address"
            checked={useNewAddress}
            onChange={() => setUseNewAddress(true)}
          />
          <label className="form-check-label">
            <strong>Use a new address</strong>
          </label>
        </div>

        {useNewAddress && (
          <div className="card">
            <div className="card-body">
              <h6 className="mb-3">Enter New Address</h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newAddress.name}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <label className="form-label">Address Line 1</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newAddress.line1}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, line1: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <label className="form-label">Address Line 2</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newAddress.line2}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, line2: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, state: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newAddress.pincode}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, pincode: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        className="btn btn-success"
        onClick={handleProceed}
        disabled={loading}
      >
        {loading ? "Processing..." : "Proceed to Payment"}
      </button>
    </div>
  );
}
