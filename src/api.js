/**
 * CARVO API client
 * Module 1: authentication + role-based routing
 */
(function (window) {
  const API_BASE_URL =
    window.CARVO_API_BASE_URL ||
    localStorage.getItem("carvo_api_base_url") ||
    "http://localhost:5000/api";

  const TOKEN_KEY = "carvo_token";
  const USER_KEY = "carvo_user";

  async function request(path, options) {
    const opts = options || {};
    const headers = Object.assign(
      { "Content-Type": "application/json", Accept: "application/json" },
      opts.headers || {}
    );

    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;

    const response = await fetch(API_BASE_URL + path, Object.assign({}, opts, { headers }));
    let body = null;
    try { body = await response.json(); } catch (_) {}

    if (!response.ok) {
      const error = new Error((body && body.message) || "Request failed");
      error.status = response.status;
      error.body = body;
      throw error;
    }
    return body;
  }

  async function login(email, password) {
    const body = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (!body || !body.success || !body.data || !body.data.token || !body.data.user) {
      throw new Error("Invalid login response from CARVO backend");
    }
    localStorage.setItem(TOKEN_KEY, body.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(body.data.user));
    return body.data;
  }

  function getToken() { return localStorage.getItem(TOKEN_KEY); }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
    catch (_) { return null; }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "./index.html";
  }

  function tokenPayload() {
    const token = getToken();
    if (!token) return null;
    try {
      const part = token.split(".")[1];
      const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json);
    } catch (_) { return null; }
  }

  function isAuthenticated() {
    const payload = tokenPayload();
    if (!payload) return false;
    if (payload.exp && Date.now() >= payload.exp * 1000) return false;
    return true;
  }

  function roleHome(role) {
    if (role === "ADMIN" || role === "REVIEWER") return "./admin/index.html";
    if (role === "MINISTER") return "./minister/index.html";
    return "./index.html";
  }

  function redirectForRole(role) {
    window.location.href = roleHome(role);
  }

  window.CARVO_API = {
    baseUrl: API_BASE_URL,
    request, login, getToken, getUser, logout,
    tokenPayload, isAuthenticated, roleHome, redirectForRole
  };
})(window);
