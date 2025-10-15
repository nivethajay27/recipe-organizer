import React, { useState } from "react";
import RecipeForm from "./components/RecipeForm";
import RecipeList from "./components/RecipeList";

export default function App() {
  return (
    <div className="app">
      <div className="header">
        <div className="brand">
          <h1 className="brand-title">🍴 Recipe Organizer</h1>
          <p className="brand-tag">Save recipes, tag them, and cook happier.</p>
        </div>
      </div>

      <RecipeForm onAdd={() => window.location.reload()} />
      <RecipeList />
    </div>
  );
}
