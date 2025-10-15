const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { pool } = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const upload = multer({ dest: "uploads/" });

// Get all recipes
app.get("/api/recipes", async (req, res) => {
    const search = req.query.search;
    let query = `
      SELECT r.*,
             COALESCE(
               json_agg(t.name) FILTER (WHERE t.name IS NOT NULL),
               '[]'
             ) AS tags
      FROM recipes r
      LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
      LEFT JOIN tags t ON rt.tag_id = t.id
    `;
    const params = [];
  
    if (search) {
      query += " WHERE r.title ILIKE $1 OR t.name ILIKE $1";
      params.push(`%${search}%`);
    }
  
    query += " GROUP BY r.id ORDER BY r.id DESC";
  
    const { rows } = await pool.query(query, params);
    res.json(rows);
  });
  
// Add new recipe with image
app.post("/api/recipes", upload.single("image"), async (req, res) => {
    const { title, ingredients, instructions, tags } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  
    try {
      // 1. Insert recipe
      const recipeResult = await pool.query(
        "INSERT INTO recipes (title, ingredients, instructions, image) VALUES ($1,$2,$3,$4) RETURNING *",
        [title, ingredients, instructions, imagePath]
      );
      const recipe = recipeResult.rows[0];
  
      // 2. Handle tags (comma-separated string)
      if (tags) {
        const tagList = tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
  
        for (const name of tagList) {
          // Insert tag if not exists
          const tagResult = await pool.query(
            "INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id",
            [name]
          );
          const tagId = tagResult.rows[0].id;
  
          // Link tag to recipe
          await pool.query(
            "INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
            [recipe.id, tagId]
          );
        }
      }
  
      res.status(201).json(recipe);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error saving recipe" });
    }
  });

// Toggle favorite
app.patch("/api/recipes/:id/favorite", async (req, res) => {
    const { id } = req.params;
    try {
      // Toggle favorite first
      await pool.query("UPDATE recipes SET favorite = NOT favorite WHERE id = $1", [id]);
  
      // Return full recipe with tags aggregated
      const { rows } = await pool.query(
        `
        SELECT r.*,
               COALESCE(
                 json_agg(t.name) FILTER (WHERE t.name IS NOT NULL),
                 '[]'
               ) AS tags
        FROM recipes r
        LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
        LEFT JOIN tags t ON rt.tag_id = t.id
        WHERE r.id = $1
        GROUP BY r.id
        `,
        [id]
      );
      res.json(rows[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to toggle favorite" });
    }
  });
app.listen(process.env.PORT, () =>
  console.log(`🍳 Server running on port ${process.env.PORT}`)
);
