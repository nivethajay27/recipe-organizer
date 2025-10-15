import React, { useState } from "react";
import api from "../api";

export default function RecipeForm({ onAdd }) {
  const [form, setForm] = useState({
    title: "",
    ingredients: "",
    instructions: "",
    tags:"",
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (image) formData.append("image", image);

    const { data } = await api.post("/recipes", formData);
    onAdd(data);
    setForm({ title: "", ingredients: "", instructions: "" });
    setImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
  <div className="form-row">
    <input name="title" className="input" placeholder="Title *" value={form.title} onChange={handleChange} required />
    <input type="file" onChange={(e)=>setImage(e.target.files[0])} />
  </div>

  <textarea name="ingredients" placeholder="Ingredients (comma or line separated)" value={form.ingredients} onChange={handleChange} />
  <input
  name="tags"
  className="input"
  placeholder="Tags (comma separated, e.g. vegan, dessert)"
  value={form.tags || ""}
  onChange={handleChange}
/>

  <textarea name="instructions" placeholder="Instructions" value={form.instructions} onChange={handleChange} />

  <div className="row">
    <button className="btn" type="submit">Save Recipe</button>
    
  </div>
</form>

  );
}
