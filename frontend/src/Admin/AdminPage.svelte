<script>
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";
  import config from "../config.js";
  import { menu, activeCatId, refreshMenu, api } from "../data.js";
  import ItemsPanel from "./ItemsPanel.svelte";
  import Modal from "./Modal.svelte";

  let loadError = false;
  let catModalOpen = false;
  let catModalMode = "add";
  let catModalInitial = {};
  let openMenuFor = null;

  onMount(load);

  async function load() {
    loadError = false;
    try {
      await refreshMenu();
    } catch (e) {
      loadError = true;
    }
  }

  function selectCategory(id) {
    activeCatId.set(id);
    openMenuFor = null;
  }

  function openAddCategory() {
    catModalMode = "add";
    catModalInitial = {};
    catModalOpen = true;
  }

  function openEditCategory(cat) {
    catModalMode = "edit";
    catModalInitial = { id: cat.C_id, name: cat.C_name, avail: cat.C_avail };
    catModalOpen = true;
    openMenuFor = null;
  }

  async function deleteCategory(cat) {
    if (!confirm(`Delete "${cat.C_name}" and all its items?`)) return;
    await api.deleteCategory(cat.C_id);
    if ($activeCatId === cat.C_id) activeCatId.set(null);
    await load();
    openMenuFor = null;
  }

  async function handleCatSaved() {
    catModalOpen = false;
    await load();
  }

  function logout() {
    // No backend /logout endpoint exists yet, so this only clears
    // client-side navigation — the auth cookie itself remains valid
    // until it expires (see accompanying note).
    push("/login");
  }
</script>

<div class="shell">
  <header>
    <h1>{config.restaurantName} <span>· Admin</span></h1>
    <button class="logout-btn" on:click={logout}>Log Out</button>
  </header>

  <div class="body">
    <aside>
      <div class="stats">
        <div class="stat">
          <span class="stat-value">{$menu.categories.length}</span>
          <span class="stat-label">Categories</span>
        </div>
        <div class="stat">
          <span class="stat-value">{$menu.items.length}</span>
          <span class="stat-label">Items</span>
        </div>
      </div>

      <div class="section-label">
        <span>Categories</span>
        <button class="add-btn" on:click={openAddCategory} aria-label="Add category">+</button>
      </div>

      <div class="cat-list">
        {#if loadError}
          <p class="empty-msg">Couldn't load categories.</p>
        {:else if $menu.categories.length === 0}
          <p class="empty-msg">No categories yet.</p>
        {/if}

        {#each $menu.categories as cat (cat.C_id)}
          <div class="cat-row" class:active={$activeCatId === cat.C_id}>
            <button class="cat-name" on:click={() => selectCategory(cat.C_id)}>
              {cat.C_name}
              {#if !cat.C_avail}<span class="tag-hidden">hidden</span>{/if}
            </button>
            <button
              class="kebab"
              on:click={() => (openMenuFor = openMenuFor === cat.C_id ? null : cat.C_id)}
              aria-label="Category options"
            >⋮</button>
          </div>
          {#if openMenuFor === cat.C_id}
            <div class="inline-menu">
              <button on:click={() => openEditCategory(cat)}>Edit</button>
              <button class="danger" on:click={() => deleteCategory(cat)}>Delete</button>
            </div>
          {/if}
        {/each}
      </div>
    </aside>

    <section>
      <ItemsPanel />
    </section>
  </div>
</div>

{#if catModalOpen}
  <Modal
    kind="category"
    mode={catModalMode}
    initial={catModalInitial}
    on:saved={handleCatSaved}
    on:close={() => (catModalOpen = false)}
  />
{/if}

<style>
  .shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--ledger-paper-edge);
    font-family: "Inter", sans-serif;
    color: var(--ledger-ink);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.5rem;
    background: var(--ledger-paper);
    border-bottom: 1px solid rgba(35, 32, 27, 0.15);
  }
  header h1 {
    font-family: "Fraunces", serif;
    font-weight: 500;
    font-size: 1.3rem;
    margin: 0;
  }
  header h1 span {
    color: var(--ledger-gold);
    font-weight: 400;
  }
  .logout-btn {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ledger-wine);
    background: none;
    border: 1px solid var(--ledger-wine);
    border-radius: 999px;
    padding: 0.4rem 0.9rem;
    cursor: pointer;
  }

  .body {
    flex: 1;
    display: flex;
    min-height: 0;
  }

  aside {
    width: 280px;
    flex-shrink: 0;
    background: var(--ledger-paper);
    border-right: 1px solid rgba(35, 32, 27, 0.15);
    padding: 1.25rem 0;
    overflow-y: auto;
  }

  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: rgba(35, 32, 27, 0.1);
    border-top: 1px solid rgba(35, 32, 27, 0.1);
    border-bottom: 1px solid rgba(35, 32, 27, 0.1);
    margin-bottom: 1rem;
  }
  .stat {
    background: var(--ledger-paper);
    padding: 0.85rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .stat-value {
    font-family: "Fraunces", serif;
    font-size: 1.4rem;
  }
  .stat-label {
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ledger-ink-soft);
  }

  .section-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.25rem 0.6rem;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ledger-ink-soft);
  }
  .add-btn {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    border: 1px solid var(--ledger-gold);
    color: var(--ledger-gold);
    background: rgba(169, 133, 46, 0.08);
    font-size: 0.9rem;
    line-height: 1;
    cursor: pointer;
  }

  .cat-list {
    display: flex;
    flex-direction: column;
    padding: 0 0.6rem;
  }
  .empty-msg {
    color: var(--ledger-ink-soft);
    font-size: 0.82rem;
    padding: 0.5rem 0.65rem;
  }

  .cat-row {
    display: flex;
    align-items: center;
    border-radius: 3px;
  }
  .cat-row.active {
    background: rgba(169, 133, 46, 0.12);
  }
  .cat-name {
    flex: 1;
    text-align: left;
    background: none;
    border: none;
    padding: 0.6rem 0.65rem;
    font-size: 0.92rem;
    color: var(--ledger-ink);
    cursor: pointer;
  }
  .cat-row.active .cat-name {
    color: var(--ledger-wine);
    font-weight: 600;
  }
  .tag-hidden {
    margin-left: 0.4rem;
    font-size: 0.62rem;
    color: var(--ledger-ink-soft);
    text-transform: uppercase;
  }
  .kebab {
    background: none;
    border: none;
    color: var(--ledger-ink-soft);
    cursor: pointer;
    padding: 0.4rem 0.6rem;
  }

  .inline-menu {
    display: flex;
    gap: 0.5rem;
    padding: 0.3rem 0.65rem 0.6rem;
  }
  .inline-menu button {
    font-size: 0.75rem;
    font-weight: 600;
    background: none;
    border: 1px solid rgba(35, 32, 27, 0.25);
    border-radius: 3px;
    padding: 0.3rem 0.7rem;
    cursor: pointer;
    color: var(--ledger-ink);
  }
  .inline-menu .danger {
    border-color: var(--ledger-red);
    color: var(--ledger-red);
  }

  section {
    flex: 1;
    min-width: 0;
    padding: 1.5rem;
    overflow-y: auto;
  }

  @media (max-width: 760px) {
    .body {
      flex-direction: column;
    }
    aside {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid rgba(35, 32, 27, 0.15);
      max-height: 40vh;
    }
    section {
      padding: 1rem;
    }
  }
</style>
