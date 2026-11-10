const STORAGE_KEY = "danbooru_favorite_characters";
const DEFAULT_TAGS = ["morrigan_aensland", "tatsumaki", "sol_badguy"];

let favorites = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_TAGS;
let activeTag = favorites[0] || null;

const favoritesList = document.getElementById("favorites-list");
const tagForm = document.getElementById("add-tag-form");
const tagInput = document.getElementById("tag-input");
const artCard = document.getElementById("art-card");
const artImage = document.getElementById("art-image");
const artCharacter = document.getElementById("art-character");
const artArtist = document.getElementById("art-artist");
const artSource = document.getElementById("art-source");
const statusMessage = document.getElementById("status-message");

function saveFavorites() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

function deleteTag(tagToDelete, event) {
  event.stopPropagation(); // Prevent triggering loadArt on the parent button
  favorites = favorites.filter((t) => t !== tagToDelete);
  saveFavorites();

  if (activeTag === tagToDelete) {
    activeTag = favorites[0] || null;
    if (activeTag) {
      loadArt(activeTag);
    } else {
      setStatus("Add a character tag to see daily art.");
    }
  }

  renderSidebar();
}

function renderSidebar() {
  favoritesList.innerHTML = "";
  favorites.forEach((tag) => {
    const item = document.createElement("div");
    item.className = `tag-item ${tag === activeTag ? "active" : ""}`;
    item.addEventListener("click", () => loadArt(tag));

    const label = document.createElement("span");
    label.className = "tag-label";
    label.textContent = tag.replace(/_/g, " ");

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "tag-delete-btn";
    deleteBtn.setAttribute("type", "button");
    deleteBtn.setAttribute("title", `Delete ${tag.replace(/_/g, " ")}`);
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", (e) => deleteTag(tag, e));

    item.appendChild(label);
    item.appendChild(deleteBtn);
    favoritesList.appendChild(item);
  });
}

function setStatus(msg) {
  artCard.classList.add("hidden");
  statusMessage.textContent = msg;
  statusMessage.classList.remove("hidden");
}

async function loadArt(tag) {
  activeTag = tag;
  renderSidebar();
  setStatus(`Fetching daily art for ${tag.replace(/_/g, " ")}...`);

  try {
    const res = await fetch(`/api/art/${encodeURIComponent(tag)}`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    displayArt(data);
  } catch (err) {
    setStatus(`Failed to load artwork: ${err.message}`);
  }
}

function displayArt(data) {
  statusMessage.classList.add("hidden");
  artImage.src = data.imageUrl;
  artCharacter.textContent = data.tag.replace(/_/g, " ");
  artArtist.textContent = `Artist: ${data.artist.replace(/_/g, " ")}`;
  artSource.href = data.source;
  artCard.classList.remove("hidden");
}

tagForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const rawTag = tagInput.value.trim().toLowerCase().replace(/\s+/g, "_");
  if (!rawTag) return;

  if (!favorites.includes(rawTag)) {
    favorites.push(rawTag);
    saveFavorites();
  }
  tagInput.value = "";
  loadArt(rawTag);
});

// Initialization
renderSidebar();
if (activeTag) {
  loadArt(activeTag);
} else {
  setStatus("Add a character tag to see daily art.");
}