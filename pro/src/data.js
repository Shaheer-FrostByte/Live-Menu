// ── Demo data layer (100% frontend) ─────────────────────────────
// No backend, no database, no secrets. All menu data lives in memory
// in this module:
//   - it survives moving between pages (Menu <-> Login <-> Admin),
//     because the app never reloads when you navigate;
//   - it resets to the seed data below when the browser tab is
//     reloaded or closed and reopened.
// Field names match the real API payloads (C_name, C_avail, I_name,
// I_price, I_avail, cat_id), so the pages don't need to change.

import { writable } from "svelte/store";
import { push } from "svelte-spa-router";

// Demo login (shown on the login page).
export const DEMO_EMAIL = "demo@gmail.com";
export const DEMO_PASSWORD = "demo4567";

// ── Reactive state ─────────────────────────────────────────────
export const menu = writable({ categories: [], items: [] });
export const activeCatId = writable(null);

// ── Fake database ──────────────────────────────────────────────
const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? "id-" + Math.random().toString(36).slice(2);

// [category name, available?, [[item name, price, available?], ...]]
const SEED = [
  ["Burgers", true, [
    ["Zinger Burger", 450, true],
    ["Smash Beef Burger", 550, true],
    ["Double Patty Cheese", 690, true],
    ["Chicken Club Sandwich", 520, true],
    ["Sold Out Special", 800, false], // hidden on the public menu
  ]],
  ["Pizza", true, [
    ["Fajita Pizza (Medium)", 1100, true],
    ["Chicken Tikka Pizza", 1200, true],
    ["Pepperoni Feast", 1350, true],
    ["Margherita", 950, true],
  ]],
  ["Biryani & Rice", true, [
    ["Chicken Biryani", 380, true],
    ["Beef Pulao", 420, true],
    ["Egg Fried Rice", 300, true],
  ]],
  ["BBQ", true, [
    ["Chicken Tikka Leg", 400, true],
    ["Seekh Kabab (4 pcs)", 480, true],
    ["Chicken Malai Boti with Naan", 520, true],
    ["Behari Kabab", 560, true],
  ]],
  ["Fries & Sides", true, [
    ["Masala Fries", 220, true],
    ["Loaded Fries", 380, true],
    ["Onion Rings", 250, true],
    ["Garlic Bread", 300, true],
  ]],
  ["Drinks", true, [
    ["Mint Margarita", 250, true],
    ["Cold Drink", 120, true],
    ["Mango Shake", 320, true],
    ["Fresh Lime", 180, true],
  ]],
  ["Desserts", true, [
    ["Brownie with Ice Cream", 420, true],
    ["Kheer", 200, true],
    ["Gulab Jamun (2 pcs)", 180, true],
  ]],
  ["Seasonal Specials", false, [ // hidden category (C_avail = false)
    ["Winter Soup", 350, true],
  ]],
];

let db = { categories: [], items: [] };
SEED.forEach(([name, avail, list]) => {
  const C_id = uid();
  db.categories.push({ C_id, C_name: name, C_avail: avail });
  list.forEach(([I_name, I_price, I_avail]) =>
    db.items.push({ I_id: uid(), I_name, I_price, I_avail, cat_id: C_id })
  );
});

let loggedIn = false;

const clone = (o) => JSON.parse(JSON.stringify(o));
const wait = (v) => new Promise((r) => setTimeout(() => r(v), 120));

// Admin-only actions need a login, like the real API (401 -> login page).
function requireLogin() {
  if (!loggedIn) {
    push("/login");
    throw new Error("Not authenticated");
  }
}

// ── API (same shape as before) ─────────────────────────────────
export const api = {
  login: async (email, password) => {
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      throw new Error("Invalid credentials");
    }
    loggedIn = true;
    return wait({ access: true });
  },

  getMenu: async () => wait(clone(db)),

  addCategory: async (d) => {
    requireLogin();
    const c = { C_id: uid(), C_avail: true, ...d };
    db.categories.push(c);
    return wait(clone(c));
  },
  updateCategory: async (id, d) => {
    requireLogin();
    const c = db.categories.find((x) => x.C_id === id);
    if (c) Object.assign(c, d);
    return wait(clone(c));
  },
  deleteCategory: async (id) => {
    requireLogin();
    db.categories = db.categories.filter((c) => c.C_id !== id);
    db.items = db.items.filter((i) => i.cat_id !== id);
    return wait({});
  },

  addItem: async (d) => {
    requireLogin();
    const i = { I_id: uid(), I_avail: true, ...d };
    db.items.push(i);
    return wait(clone(i));
  },
  updateItem: async (id, d) => {
    requireLogin();
    const i = db.items.find((x) => x.I_id === id);
    if (i) Object.assign(i, d);
    return wait(clone(i));
  },
  deleteItem: async (id) => {
    requireLogin();
    db.items = db.items.filter((i) => i.I_id !== id);
    return wait({});
  },
};

// ── Convenience: refetch and repopulate the store ────────────────
export async function refreshMenu() {
  const data = await api.getMenu();
  menu.set(data);
  return data;
}
