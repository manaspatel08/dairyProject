import { useEffect, useState } from "react";
 
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CreateProductPage() {
  const storeId = localStorage.getItem("storeId");
  const token = localStorage.getItem("token");

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "", categoryId: "" , tag:"", rating:"", oldPrice:"" ,brand:"",stock:"" ,imageUrl:""});

  useEffect(() => {
    fetch(`${BASE_URL}/categories/${storeId}`)
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []));
  }, [storeId]);

  const submit = async (e) => {
    e.preventDefault();

    await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: form.name,
        price: form.price,
        description: form.description,
        storeId,
        categoryId: form.categoryId,
        tag:form.tag,
        rating:form.rating,
        oldPrice:form.oldPrice,
        brand:form.brand,
        stock:form.stock,
        imageUrl:form.imageUrl
      }),
    });

    alert("Product created!");
  };

  return (
    <div>
      <h3>Create Product</h3>

      <form onSubmit={submit} className="mt-3">
        <div className="mb-3">
          <label>Name</label>
          <input className="form-control" onChange={(e) => setForm({...form, name: e.target.value})} />
        </div>

        <div className="mb-3">
          <label>Price</label>
          <input className="form-control" onChange={(e) => setForm({...form, price: e.target.value})} />
        </div>

        <div className="mb-3">
          <label>Description</label>
          <textarea className="form-control" onChange={(e) => setForm({...form, description: e.target.value})}></textarea>
        </div>

        <div className="mb-3">
          <label>Category</label>
          <select className="form-select"
            onChange={(e) => setForm({...form, categoryId: e.target.value})}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
           <label>Tag</label>
           <input className="form-control" onChange={(e)=> setForm({...form,tag:e.target.value})}></input>
        </div>

        <div className="mb-3">
          <label>Rating</label>
          <input className="form-control" onChange={(e)=> setForm({...form,rating:e.target.value})}  />
        </div>

        <div className="mb-3">
          <label>Old Price</label>
          <input className="form-control" onChange={(e)=> setForm({...form,oldPrice:e.target.value})} />
        </div>

        <div className="mb-3">
          <label>Brand</label>
          <input className="form-control" onChange={(e)=> setForm({...form,brand:e.target.value})} />
        </div>

        <div className="mb-3">
         <label>Stock</label>
         <input className="form-control" onChange={(e)=>setForm({...form,stock:e.target.value})}></input>
        </div>

         <div className="mb-3">
         <label>Product Image</label>
         <input className="form-control" onChange={(e)=>setForm({...form,imageUrl:e.target.value})}></input>
        </div>

        <button className="btn btn-primary">Create</button>
      </form>
    </div>
  );
}






