import React, { useEffect, useState, useCallback } from "react";
import api from "../api";
import RecipeCard from "./RecipeCard";

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");

  const fetchRecipes = useCallback(
    async (term = search) => {
      const { data } = await api.get(`/recipes?search=${encodeURIComponent(term)}`);
      setRecipes(data);
    },
    [search]
  );

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleFavorite = (updated) => {
    setRecipes(prev =>
      prev.map(r => (r.id === updated.id ? { ...r, favorite: updated.favorite } : r))
    );
  };

  const handleTagClick = (tag) => {
    setSearch(tag);
    fetchRecipes(tag);
  };

  return (
    <div>
      <div className="search-section">
        <div className="search-inner">
          <input
            className="input"
            placeholder="Search recipes… (e.g. pasta, vegan, curry)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn" onClick={() => fetchRecipes()}>
            Search
          </button>
          {search && (
            <button
              className="btn ghost"
              onClick={() => {
                setSearch("");
                fetchRecipes("");
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="spacer" />
      {recipes.length === 0 ? (
        <div className="empty">No recipes yet. Try adding one above ✨</div>
      ) : (
        <div className="grid">
          {recipes.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              onFavorite={handleFavorite}
              onTagClick={handleTagClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
