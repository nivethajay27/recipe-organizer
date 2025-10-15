import React, { useState } from "react";
import api from "../api";

export default function RecipeCard({ recipe, onFavorite, onTagClick }) {
  const [open, setOpen] = useState(false);

  const toggleFavorite = async () => {
    const { data } = await api.patch(`/recipes/${recipe.id}/favorite`);
    onFavorite(data);
  };

  const ingredientLines = (recipe.ingredients || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <div className="card">
        {recipe.image && (
          <img
            src={`http://localhost:4000${recipe.image}`}
            alt={recipe.title}
          />
        )}

        <div className="card-body">
          <h3 className="card-title">{recipe.title}</h3>

          {recipe.tags?.length > 0 && (
            <div className="card-meta">
              {recipe.tags.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  className="tag tag-click"
                  onClick={() => onTagClick?.(t)}
                  aria-label={`Filter by tag ${t}`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          {ingredientLines.length > 0 && (
            <p className="help multiline">{ingredientLines[0]}</p>
          )}
        </div>

        <div className="card-actions">
          <button
            className={`fav ${recipe.favorite ? "active" : ""}`}
            onClick={toggleFavorite}
          >
            {recipe.favorite ? "💖 Favorited" : "🤍 Favorite"}
          </button>
          <button className="btn ghost" onClick={() => setOpen(true)}>
            View
          </button>
        </div>
      </div>

      {open && (
  <div className="modal-backdrop" onClick={() => setOpen(false)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{recipe.title}</h3>
        <button className="icon-btn" onClick={() => setOpen(false)}>✕</button>
      </div>

      {/* Tags row inside modal */}
      {Array.isArray(recipe.tags) && recipe.tags.length > 0 && (
        <div className="modal-section">
          <div className="card-meta">
            {recipe.tags.map((t, i) => (
              <span key={i} className="tag">#{t}</span>
            ))}
          </div>
        </div>
      )}

      {recipe.image && (
        <img className="modal-img" src={`http://localhost:4000${recipe.image}`} alt={recipe.title} />
      )}

      <div className="modal-section">
        <h4>Ingredients</h4>
        <ul className="bullet-list">
          {ingredientLines.map((line, i) => <li key={i}>{line}</li>)}
        </ul>
      </div>

      {recipe.instructions && (
        <div className="modal-section">
          <h4>Instructions</h4>
          <p className="multiline">{recipe.instructions}</p>
        </div>
      )}
    </div>
  </div>
)}
    </>
  );
}
