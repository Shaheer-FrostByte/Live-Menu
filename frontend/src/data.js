// ── API + State ─────────────────────────────────────────────────
// Combines what would otherwise be api.js + store.js. Field names
// on all payloads match server/schema.py exactly (C_name, C_avail,
// I_name, I_price, I_avail, cat_id).

import { writable } from "svelte/store";
import { push } from "svelte-spa-router";
import config from "./config.js";

const BASE = config.backendUrl;

// ── Reactive state ─────────────────────────────────────────────
export const menu = writable({ categories: [], items: [] });

const savedCatId = sessionStorage.getItem("activeCatId");
export const activeCatId = writable(savedCatId || null);
activeCatId.subscribe((id) => {
  if (id) sessionStorage.setItem("activeCatId", id);
  else sessionStorage.removeItem("activeCatId");
});

// ── Low-level request helper ───────────────────────────────────
async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    credentials: "include", // required: cookie-based auth
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 401) {
    push("/login");
    throw new Error("Not authenticated");
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.detail || "Request failed");
  }
  return body;
}

// ── API ─────────────────────────────────────────────────────────
export const api = {
  login: (email, password) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMenu: () => request("/get_menu"),

  addCategory: (data) =>
    request("/category/add", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id, data) =>
    request(`/category/update?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCategory: (id) =>
    request(`/category/delete?id=${id}`, { method: "DELETE" }),

  addItem: (data) =>
    request("/item/add", { method: "POST", body: JSON.stringify(data) }),
  updateItem: (id, data) =>
    request(`/item/update?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteItem: (id) => request(`/item/delete?id=${id}`, { method: "DELETE" }),
};

// ── Convenience: refetch and repopulate the store ────────────────
export async function refreshMenu() {
  const data = await api.getMenu();
  menu.set(data);
  return data;
}
