import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { fetchDailyArt } from "./services/danbooru.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/art/:tag", async (req, res) => {
  const { tag } = req.params;
  try {
    const artData = await fetchDailyArt(tag);
    if (!artData) {
      return res.status(404).json({ error: "No posts found for this character." });
    }
    return res.json(artData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});