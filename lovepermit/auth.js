const API_BASE = "https://user-backend.lovepermit.workers.dev";

// The single account allowed to see the admin dashboard.
const ADMIN_EMAIL = "manojsalem98@gmail.com";

function isAdmin(user) {
    return !!user && user.email === ADMIN_EMAIL;
}

/**
 * Like getUser(), but also kicks non-admins back to the home page.
 * Use this at the top of admin.js.
 */
function requireAdmin() {
    const user = getUser();
    if (!user) return null; // getUser() already redirected to index.html

    if (!isAdmin(user)) {
        window.location.href = "home.html";
        return null;
    }

    return user;
}

// Generic placeholder avatar so a missing/broken photo URL never
// shows a broken-image icon.
const DEFAULT_AVATAR =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E" +
    "%3Ccircle cx='50' cy='50' r='50' fill='%23eee'/%3E" +
    "%3Ccircle cx='50' cy='38' r='18' fill='%23bbb'/%3E" +
    "%3Cellipse cx='50' cy='85' rx='32' ry='22' fill='%23bbb'/%3E%3C/svg%3E";

/**
 * Reads the logged-in user from localStorage.
 * Redirects to the login page if no session exists.
 * Returns null when redirecting so callers can bail out early.
 */
function getUser() {
    const raw = localStorage.getItem("user");

    if (!raw) {
        window.location.href = "index.html";
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (err) {
        console.error("Corrupted session data:", err);
        logout();
        return null;
    }
}

function getToken() {
    return localStorage.getItem("token");
}

function saveSession(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

/**
 * Fetch wrapper that attaches the auth token automatically and
 * logs the user out if the session has expired (401).
 */
async function apiFetch(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    const token = getToken();
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    // Force a real network hit every time. Without this, the browser's
    // HTTP cache can serve a stale response for a repeated URL (e.g.
    // GET /permits) even after logging out and back in as a different
    // account — browsers don't vary the cache by Authorization header
    // by default, so two different users hitting the same endpoint on
    // the same device/browser could otherwise see each other's cached
    // data.
    const res = await fetch(API_BASE + path, { ...options, headers, cache: "no-store" });

    if (res.status === 401) {
        logout();
        throw new Error("Session expired");
    }

    return res;
}

/**
 * Sets an <img>'s src safely, falling back to a placeholder if the
 * URL is missing or fails to load.
 */
function setAvatar(imgEl, url) {
    imgEl.src = url || DEFAULT_AVATAR;
    imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = DEFAULT_AVATAR;
    };
}

/**
 * Wires up the hamburger button (#menu-btn) to toggle the dropdown
 * menu (#menu-panel) used across the app's mobile-shell pages
 * (home, profile, orders). Safe no-op if those elements aren't
 * present on the current page.
 */
function initAppMenu() {
    const menuBtn = document.getElementById("menu-btn");
    const menuPanel = document.getElementById("menu-panel");
    if (!menuBtn || !menuPanel) return;

    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        menuPanel.hidden = !menuPanel.hidden;
    });

    document.addEventListener("click", (e) => {
        if (!menuPanel.hidden && !menuPanel.contains(e.target) && e.target !== menuBtn) {
            menuPanel.hidden = true;
        }
    });
}
