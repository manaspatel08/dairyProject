import React, { useState, useEffect } from "react";
import axios from "../api";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/products")
      .then((res) => {
        const data = res.data?.data || res.data || [];
        const list = Array.isArray(data) ? data : [];

        const catSet = new Set(
          list
            .map((p) => p.category?.name || p.category)
            .filter(Boolean)
        );

        setCategories([...catSet]);
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (selectedCat) params.set("category", selectedCat);
  
    const qs = params.toString();
    navigate(`/products${qs ? `?${qs}` : ""}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="input-group">
      <input
        type="text"
        className="form-control"
        placeholder="Search for items..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {/* <select
        className="form-select"
        style={{ maxWidth: 180 }}
        value={selectedCat}
        onChange={(e) => setSelectedCat(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select> */}

      <button className="btn btn-danger" type="button" onClick={handleSearch}>
        <CiSearch />
      </button>
    </div>
  );
}

