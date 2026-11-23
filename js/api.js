// Reusable Trello API service. Every network call in the app goes through here.
const Api = {
  validateConfig() {
    const placeholder = (v) => !v || String(v).startsWith("YOUR_");
    if (placeholder(CONFIG.API_KEY)) throw new Error("Missing API key. Set API_KEY in js/config.js.");
    if (placeholder(CONFIG.API_TOKEN)) throw new Error("Missing API token. Set API_TOKEN in js/config.js.");
    if (placeholder(CONFIG.BOARD_ID)) throw new Error("Missing Board ID. Set BOARD_ID in js/config.js.");
  },

  friendlyError(status, body) {
    const text = (body || "").toLowerCase();
    if (status === 401 && text.includes("key")) return "Invalid API key. Check API_KEY in js/config.js.";
    if (status === 401 && text.includes("token")) return "Invalid or expired API token. Generate a new token.";
    if (status === 401) return "Unauthorized. Check your API key and token.";
    if (status === 403) return "Permission denied. Your token needs read and write access to this board.";
    if (status === 404) return "Not found. Check the Board ID or the item may have been deleted.";
    if (status === 400) return `Bad request: ${body || "invalid input or ID"}`;
    if (status === 429) return "Too many requests. Wait a moment and try again.";
    return `Request failed (${status}). ${body || ""}`.trim();
  },

  async request(method, path, params = {}) {
    this.validateConfig();
    const url = new URL(CONFIG.API_BASE_URL + path);
    url.searchParams.set("key", CONFIG.API_KEY);
    url.searchParams.set("token", CONFIG.API_TOKEN);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    let res;
    try {
      res = await fetch(url.toString(), { method, headers: { Accept: "application/json" } });
    } catch (err) {
      throw new Error("Network error. Check your internet connection and try again.");
    }
    const text = await res.text();
    if (!res.ok) throw new Error(this.friendlyError(res.status, text));
    try {
      return text ? JSON.parse(text) : null;
    } catch (err) {
      return text;
    }
  },

  get: (path, params) => Api.request("GET", path, params),
  post: (path, params) => Api.request("POST", path, params),
  put: (path, params) => Api.request("PUT", path, params),
  delete: (path, params) => Api.request("DELETE", path, params),
};
