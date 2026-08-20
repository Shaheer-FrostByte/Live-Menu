const SVG_NS = "http://www.w3.org/2000/svg";
const SERVER = "https://website-backend-production-ac2b.up.railway.app";

// ── State ───────────────────────────────────────────────────────
let activeCatId = sessionStorage.getItem("activeCatId") || null;

// ── Helpers ─────────────────────────────────────────────────────
function make_kebab_svg() {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("viewBox", "0 0 24 24");
    [5, 12, 19].forEach(cy => {
        const c = document.createElementNS(SVG_NS, "circle");
        c.setAttribute("cx", "12");
        c.setAttribute("cy", cy);
        c.setAttribute("r", "2");
        svg.appendChild(c);
    });
    return svg;
}

// ── API ─────────────────────────────────────────────────────────
async function load_data() {
    const res = await fetch(SERVER);
    return res.json();
}

async function api_post(body) {
    const res = await fetch(`${SERVER}/public/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return res.json();
}

async function api_put(body) {
    const res = await fetch(`${SERVER}/public/admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return res.json();
}

async function api_delete(body) {
    const res = await fetch(`${SERVER}/public/admin`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return res.json();
}

// ── Render ──────────────────────────────────────────────────────
function render(data) {
    document.getElementById("stat-categories").innerText = data.categories.length;
    document.getElementById("stat-items").innerText = data.items.length;

    add_categories(data.categories);

    if (activeCatId) {
        const cat = document.getElementById(activeCatId);
        if (cat) {
            add_items(data.items, cat);
        } else {
            activeCatId = null;
            sessionStorage.removeItem("activeCatId");
            document.getElementById("cat_name").innerText = "Select a Category";
            document.getElementById("item-count").innerText = "";
            document.getElementById("items_list").innerHTML = "";
        }
    }
}

async function refresh() {
    console.log("refreshing, activeCatId =", activeCatId);
    const data = await load_data();
    render(data);
    wire_category_clicks(data);
}

function add_categories(cats) {
    const cat_list = document.getElementById("category_list");
    cat_list.innerHTML = "";

    cats.forEach(e => {
        const name = document.createElement("button");
        name.innerText = e.C_name;

        const kebab = document.createElement("button");
        kebab.classList.add("cat-kebab");
        kebab.type = "button";
        kebab.appendChild(make_kebab_svg());
        kebab.addEventListener("click", ev => {
            ev.stopPropagation();
            open_dropdown(ev.currentTarget, {
                type: "category",
                id: e.C_id,
                name: e.C_name,
                isAvail: e.C_isAvail,
            });
        });

        const category = document.createElement("div");
        category.id = e.C_id;
        category.classList.add("category");
        if (e.C_id === activeCatId) category.classList.add("active");
        category.dataset.initial = e.C_name.charAt(0).toUpperCase();
        category.append(name, kebab);

        cat_list.append(category);
    });
}

function add_items(items, cat) {
    const display_items = items.filter(i => i.cat_id == cat.id);
    const item_list = document.getElementById("items_list");
    item_list.innerHTML = "";

    display_items.forEach(e => {
        const name = document.createElement("p");
        name.innerText = e.I_name;

        const price = document.createElement("p");
        price.innerText = `Rs. ${e.I_price}`;

        const avail = document.createElement("input");
        avail.type = "checkbox";
        avail.checked = Boolean(e.I_isAvail);

        const edit_button = document.createElement("button");
        edit_button.type = "button";
        edit_button.appendChild(make_kebab_svg());
        edit_button.addEventListener("click", ev => {
            ev.stopPropagation();
            open_dropdown(ev.currentTarget, {
                type: "item",
                id: e.I_id,
                name: e.I_name,
                price: e.I_price,
                isAvail: e.I_isAvail,
                cat_id: e.cat_id,
            });
        });

        const item = document.createElement("div");
        item.id = e.I_id;
        item.classList.add("item");
        item.append(name, price, avail, edit_button);
        item_list.append(item);
    });

    document.getElementById("cat_name").innerText = cat.querySelector("button").innerText;
    document.getElementById("item-count").innerText =
        display_items.length === 1 ? "1 item" : `${display_items.length} items`;

    document.querySelectorAll(".category").forEach(c => c.classList.remove("active"));
    cat.classList.add("active");
    activeCatId = cat.id;
    sessionStorage.setItem("activeCatId", cat.id);
}

function wire_category_clicks(data) {
    const cat_list = document.getElementById("category_list");
    // Clone to remove old listeners before re-adding
    const fresh = cat_list.cloneNode(true);
    cat_list.parentNode.replaceChild(fresh, cat_list);

    // Re-attach kebab listeners after clone
    data.categories.forEach(e => {
        const cat = document.getElementById(e.C_id);
        if (!cat) return;
        const kebab = cat.querySelector(".cat-kebab");
        if (kebab) {
            kebab.addEventListener("click", ev => {
                ev.stopPropagation();
                open_dropdown(ev.currentTarget, {
                    type: "category",
                    id: e.C_id,
                    name: e.C_name,
                    isAvail: e.C_isAvail,
                });
            });
        }
    });

    document.getElementById("category_list").addEventListener("click", ev => {
        if (ev.target.closest(".cat-kebab")) return;
        const cat = ev.target.closest(".category");
        if (cat) {
            add_items(data.items, cat);
            if (isMobile()) {
                aside.classList.remove("mobile-open");
                backdrop.classList.remove("visible");
            }
        }
    });
}

// ── Kebab Dropdown ──────────────────────────────────────────────
const dropdown      = document.getElementById("kebab-dropdown");
const dropdownEdit  = document.getElementById("dropdown-edit");
const dropdownDelete = document.getElementById("dropdown-delete");
let dropdownContext = null;

function open_dropdown(anchor, context) {
    dropdownContext = context;
    dropdown.classList.remove("hidden");

    const rect = anchor.getBoundingClientRect();
    const ddW  = 140;
    const ddH  = 88;

    let top  = rect.bottom + 4;
    let left = rect.right - ddW;

    if (top + ddH > window.innerHeight - 8) top = rect.top - ddH - 4;
    if (left < 8) left = rect.left;

    dropdown.style.top  = `${top}px`;
    dropdown.style.left = `${left}px`;
}

function close_dropdown() {
    dropdown.classList.add("hidden");
    dropdownContext = null;
}

dropdownEdit.addEventListener("click", () => {
    if (!dropdownContext) return;
    if (dropdownContext.type === "item") {
        open_item_modal("edit", dropdownContext);
    } else {
        open_cat_modal("edit", dropdownContext);
    }
    close_dropdown();
});

dropdownDelete.addEventListener("click", async () => {
    if (!dropdownContext) return;
    const ctx = dropdownContext;
    close_dropdown();

    try {
        await api_delete({ for_item: ctx.type === "item", id: ctx.id });
        if (ctx.type === "category" && activeCatId === ctx.id) {
            activeCatId = null;
            sessionStorage.removeItem("activeCatId");
            document.getElementById("cat_name").innerText = "Select a Category";
            document.getElementById("item-count").innerText = "";
            document.getElementById("items_list").innerHTML = "";
        }
        await refresh();
    } catch (err) {
        console.error("Delete failed:", err);
    }
});

document.addEventListener("click", e => {
    if (!dropdown.classList.contains("hidden") &&
        !dropdown.contains(e.target) &&
        !e.target.closest(".cat-kebab") &&
        !e.target.closest(".item button")) {
        close_dropdown();
    }
});

// ── Item Modal ──────────────────────────────────────────────────
const itemModal       = document.getElementById("item-modal");
const itemModalTitle  = document.getElementById("item-modal-title");
const itemModalClose  = document.getElementById("item-modal-close");
const itemModalCancel = document.getElementById("item-modal-cancel");
const itemModalSave   = document.getElementById("item-modal-save");
const itemFormName    = document.getElementById("item-form-name");
const itemFormPrice   = document.getElementById("item-form-price");
const itemFormAvail   = document.getElementById("item-form-avail");
const itemErrorName   = document.getElementById("item-error-name");
const itemErrorPrice  = document.getElementById("item-error-price");
const itemToastCont   = document.getElementById("item-toast-container");

let itemModalMode = null;
let itemModalData = null;

function clear_item_errors() {
    itemFormName.classList.remove("input-error");
    itemFormPrice.classList.remove("input-error");
    itemErrorName.textContent  = "";
    itemErrorPrice.textContent = "";
    itemToastCont.innerHTML    = "";
}

function open_item_modal(mode, data = null) {
    itemModalMode = mode;
    itemModalData = data;
    itemModalTitle.textContent = mode === "add" ? "Add Item" : "Edit Item";
    itemFormName.value    = data?.name  ?? "";
    itemFormPrice.value   = data?.price ?? "";
    itemFormAvail.checked = Boolean(data?.isAvail ?? true);
    clear_item_errors();
    itemModal.classList.remove("hidden");
    itemFormName.focus();
}

function close_item_modal() {
    itemModal.classList.add("hidden");
    itemModalMode = null;
    itemModalData = null;
    clear_item_errors();
}

itemModalClose.addEventListener("click", close_item_modal);
itemModalCancel.addEventListener("click", close_item_modal);
itemModal.addEventListener("click", e => { if (e.target === itemModal) close_item_modal(); });

itemFormName.addEventListener("input", () => {
    if (itemFormName.value.trim()) {
        itemFormName.classList.remove("input-error");
        itemErrorName.textContent = "";
    }
});
itemFormPrice.addEventListener("input", () => {
    const v = itemFormPrice.value.trim();
    if (v && !isNaN(v)) {
        itemFormPrice.classList.remove("input-error");
        itemErrorPrice.textContent = "";
    }
});

itemModalSave.addEventListener("click", async () => {
    const nameVal  = itemFormName.value.trim();
    const priceVal = itemFormPrice.value.trim();
    let valid = true;

    if (!nameVal) {
        itemFormName.classList.add("input-error");
        itemErrorName.textContent = "Item name cannot be empty.";
        valid = false;
    }
    if (!priceVal) {
        itemFormPrice.classList.add("input-error");
        itemErrorPrice.textContent = "Price cannot be empty.";
        valid = false;
    } else if (isNaN(priceVal)) {
        itemFormPrice.classList.add("input-error");
        itemErrorPrice.textContent = "Price must be a number.";
        valid = false;
    } else if (Number(priceVal) < 0) {
        itemFormPrice.classList.add("input-error");
        itemErrorPrice.textContent = "Price cannot be negative.";
        valid = false;
    }

    if (!valid) {
        show_toast(itemToastCont, "Please fix the errors before saving.", "error");
        return;
    }

    try {
        if (itemModalMode === "add") {
            await api_post({
                for_item: true,
                name:     nameVal,
                price:    Number(priceVal),
                isAvail:  itemFormAvail.checked,
                cat_id:   activeCatId,
            });
        } else {
            await api_put({
                for_item: true,
                id:       itemModalData.id,
                name:     nameVal,
                price:    Number(priceVal),
                isAvail:  itemFormAvail.checked,
            });
        }
        close_item_modal();
        await refresh();
    } catch (err) {
        show_toast(itemToastCont, "Server error. Please try again.", "error");
        console.error(err);
    }
});

// ── Category Modal ──────────────────────────────────────────────
const catModal       = document.getElementById("cat-modal");
const catModalTitle  = document.getElementById("cat-modal-title");
const catModalClose  = document.getElementById("cat-modal-close");
const catModalCancel = document.getElementById("cat-modal-cancel");
const catModalSave   = document.getElementById("cat-modal-save");
const catFormName    = document.getElementById("cat-form-name");
const catFormAvail   = document.getElementById("cat-form-avail");
const catErrorName   = document.getElementById("cat-error-name");
const catToastCont   = document.getElementById("cat-toast-container");

let catModalMode = null;
let catModalData = null;

function clear_cat_errors() {
    catFormName.classList.remove("input-error");
    catErrorName.textContent = "";
    catToastCont.innerHTML   = "";
}

function open_cat_modal(mode, data = null) {
    catModalMode = mode;
    catModalData = data;
    catModalTitle.textContent = mode === "add" ? "Add Category" : "Edit Category";
    catFormName.value    = data?.name ?? "";
    catFormAvail.checked = Boolean(data?.isAvail ?? true);
    clear_cat_errors();
    catModal.classList.remove("hidden");
    catFormName.focus();
}

function close_cat_modal() {
    catModal.classList.add("hidden");
    catModalMode = null;
    catModalData = null;
    clear_cat_errors();
}

catModalClose.addEventListener("click", close_cat_modal);
catModalCancel.addEventListener("click", close_cat_modal);
catModal.addEventListener("click", e => { if (e.target === catModal) close_cat_modal(); });

catFormName.addEventListener("input", () => {
    if (catFormName.value.trim()) {
        catFormName.classList.remove("input-error");
        catErrorName.textContent = "";
    }
});

catModalSave.addEventListener("click", async () => {
    const nameVal = catFormName.value.trim();

    if (!nameVal) {
        catFormName.classList.add("input-error");
        catErrorName.textContent = "Category name cannot be empty.";
        show_toast(catToastCont, "Please fix the errors before saving.", "error");
        return;
    }

    try {
        if (catModalMode === "add") {
            await api_post({
                for_item: false,
                name:     nameVal,
                isAvail:  catFormAvail.checked,
            });
        } else {
            await api_put({
                for_item: false,
                id:       catModalData.id,
                name:     nameVal,
                isAvail:  catFormAvail.checked,
            });
        }
        close_cat_modal();
        await refresh();
    } catch (err) {
        show_toast(catToastCont, "Server error. Please try again.", "error");
        console.error(err);
    }
});

// ── + Buttons ───────────────────────────────────────────────────
document.getElementById("add-category-btn").addEventListener("click", e => {
    e.stopPropagation();
    open_cat_modal("add");
});

document.getElementById("add-item-btn").addEventListener("click", () => {
    if (!activeCatId) {
        alert("Please select a category first.");
        return;
    }
    open_item_modal("add");
});

// ── Toast ───────────────────────────────────────────────────────
function show_toast(container, message, type = "error") {
    const toast = document.createElement("div");
    toast.classList.add("toast", `toast--${type}`);

    const icon = document.createElement("span");
    icon.classList.add("toast-icon");
    icon.textContent = type === "success" ? "✓" : "✕";

    const text = document.createElement("span");
    text.textContent = message;

    toast.append(icon, text);
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-hide");
        toast.addEventListener("animationend", () => toast.remove());
    }, 3000);
}

// ── Sidebar toggle ──────────────────────────────────────────────
const sidebar_btn     = document.getElementById("sidebar_btn");
const mobile_menu_btn = document.getElementById("mobile_menu_btn");
const aside           = document.getElementById("aside");
const content         = document.querySelector("main > section");
const backdrop        = document.getElementById("sidebar-backdrop");

const MOBILE_BREAKPOINT = 900;

function isMobile() { return window.innerWidth <= MOBILE_BREAKPOINT; }

function openSidebar() {
    aside.classList.add("mobile-open");
    aside.classList.remove("collapsed");
    backdrop.classList.add("visible");
}

function closeSidebar() {
    if (isMobile()) {
        aside.classList.remove("mobile-open");
        backdrop.classList.remove("visible");
    } else {
        aside.classList.add("collapsed");
        content.classList.add("collapsed");
    }
}

function initSidebarState() {
    aside.classList.remove("collapsed", "mobile-open");
    content.classList.remove("collapsed");
    backdrop.classList.remove("visible");
}

sidebar_btn.addEventListener("click", () => {
    const isCollapsed = aside.classList.toggle("collapsed");
    content.classList.toggle("collapsed", isCollapsed);
});

mobile_menu_btn.addEventListener("click", () => {
    aside.classList.contains("mobile-open") ? closeSidebar() : openSidebar();
});

backdrop.addEventListener("click", closeSidebar);

let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initSidebarState, 150);
});

const logout_btn = document.getElementById("logout");
logout_btn.addEventListener("click", () => {
    window.location.replace("../index.html");
});

initSidebarState();

// ── Boot ────────────────────────────────────────────────────────
load_data().then(data => {
    render(data);
    wire_category_clicks(data);
});