import React, { useState } from "react";
import axios from "../api";
import { toast } from "react-toastify";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/contact/send", form);
      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Contact Us</h2>

      <form onSubmit={handleSubmit} className="col-md-6">
        <div className="mb-3">
          <label>Name</label>
          <input
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Email</label>
          <input
            className="form-control"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Message</label>
          <textarea
            className="form-control"
            rows="4"
            name="message"
            value={form.message}
            onChange={handleChange}
            required
          />
        </div>

        <button className="btn btn-primary">Send Message</button>
      </form>
    </div>
  );
}
