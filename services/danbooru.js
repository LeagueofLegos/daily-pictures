const USER_AGENT = "DailyArtApp/1.0 (contact: github.com/user)";

/**
 * Fetches the daily spotlight image for a given character tag.
 * @param {string} tag
 * @returns {Promise<object|null>}
 */
export async function fetchDailyArt(tag) {
  const cleanTag = tag.trim().toLowerCase().replace(/\s+/g, "_");
  const url = new URL("https://danbooru.donmai.us/posts.json");
  url.searchParams.set("tags", `${cleanTag} rating:general`);
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Danbooru API error: ${response.status} ${response.statusText}`);
  }

  const posts = await response.json();
  if (!Array.isArray(posts) || posts.length === 0) {
    return null;
  }

  const post = posts[0];
  return {
    id: post.id,
    tag: cleanTag,
    imageUrl: post.large_file_url || post.file_url || post.preview_file_url,
    artist: post.tag_string_artist || "Unknown",
    characters: post.tag_string_character,
    source: post.source || `https://danbooru.donmai.us/posts/${post.id}`,
    createdAt: post.created_at,
  };
}