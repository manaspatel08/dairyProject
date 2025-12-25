import React, { useEffect, useState } from "react";
import axios from "../api";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get("/users/me")
      .then(res => setUser(res.data.data))
      .catch(() => toast.error("Failed to load profile"));
  }, []);

  if (!user) return <div className="container py-5">Loading...</div>;

  return (
    <div className="container py-5">
      <h2>My Profile</h2>
      <p><b>Email: </b>{user.email}</p>
      <p><b>Mobile Number: </b>{user.mobileNo || "Not set"}</p>
    </div>
  );
}
