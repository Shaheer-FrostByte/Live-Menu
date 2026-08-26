<script>
  import { menu, activeCatId, refreshMenu, api } from "../data.js";
  import Modal from "./Modal.svelte";

  let modalOpen = false;
  let modalMode = "add";
  let modalInitial = {};
  let openMenuFor = null;

  $: activeCategory = $menu.categories.find((c) => c.C_id === $activeCatId) || null;
  $: activeItems = $activeCatId
    ? $menu.items.filter((i) => i.cat_id === $activeCatId)
    : [];

  function openAdd() {
    if (!$activeCatId) {
      alert("Please select a category first.");
      return;
    }
    modalMode = "add";
    modalInitial = {};
    modalOpen = true;
  }

  function openEdit(item) {
    modalMode = "edit";
    modalInitial = {
      id: item.I_id,
      name: item.I_name,
      avail: item.I_avail,
      price: item.I_price,
    };
    modalOpen = true;
    openMenuFor = null;
  }

  async function remove(item) {
    if (!confirm(`Delete "${item.I_name}"?`)) return;
    await api.deleteItem(item.I_id);
    await refreshMenu();
    openMenuFor = null;
  }

  async function handleSaved() {
    modalOpen = false;
    await refreshMenu();
  }
</script>

<div class="panel">
  <div class="panel-header">
    <h2>{activeCategory ? activeCategory.C_name : "Select a Category"}</h2>
    {#if activeCategory}
      <span class="count">{activeItems.length} {activeItems.length === 1 ? "item" : "items"}</span>
    {/if}
  </div>

  <div class="table-head">
    <span>Item</span>
    <span>Price</span>
    <span>Available</span>
    <button class="add-btn" on:click={openAdd} aria-label="Add item">+</button>
  </div>

  <div class="rows">
    {#if !activeCategory}
      <p class="empty-msg">Choose a category from the sidebar to see its items.</p>
    {:else if activeItems.length === 0}
      <p class="empty-msg">No items in this category yet.</p>
    {/if}

    {#each activeItems as item (item.I_id)}
      <div class="row">
        <span class="item-name">{item.I_name}</span>
        <span class="item-price">Rs. {item.I_price}</span>
        <span class="item-avail" class:on={item.I_avail}>{item.I_avail ? "Yes" : "No"}</span>
        <button
          class="kebab"
          on:click={() => (openMenuFor = openMenuFor === item.I_id ? null : item.I_id)}
          aria-label="Item options"
        >⋮</button>
      </div>
      {#if openMenuFor === item.I_id}
        <div class="inline-menu">
          <button on:click={() => openEdit(item)}>Edit</button>
          <button class="danger" on:click={() => remove(item)}>Delete</button>
        </div>
      {/if}
    {/each}
  </div>
</div>

{#if modalOpen}
  <Modal
    kind="item"
    mode={modalMode}
    initial={modalInitial}
    catId={$activeCatId}
    on:saved={handleSaved}
    on:close={() => (modalOpen = false)}
  />
{/if}

<style>
  .panel {
    background: var(--ledger-paper);
    border: 1px solid rgba(35, 32, 27, 0.15);
    border-radius: 4px;
    overflow: hidden;
  }
  .panel-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 1.1rem 1.25rem;
    border-bottom: 1px solid rgba(35, 32, 27, 0.15);
  }
  .panel-header h2 {
    font-family: "Fraunces", serif;
    font-weight: 500;
    font-size: 1.2rem;
    margin: 0;
    color: var(--ledger-ink);
  }
  .count {
    font-size: 0.75rem;
    color: var(--ledger-ink-soft);
  }

  .table-head {
    display: grid;
    grid-template-columns: minmax(0, 3fr) 1fr 1fr 44px;
    align-items: center;
    padding: 0.7rem 1.25rem;
    background: var(--ledger-paper-edge);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ledger-ink-soft);
  }
  .add-btn {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    border: 1px solid var(--ledger-gold);
    color: var(--ledger-gold);
    background: rgba(169, 133, 46, 0.1);
    font-size: 0.9rem;
    cursor: pointer;
    justify-self: center;
  }

  .rows { padding: 0 0.25rem; }
  .empty-msg {
    padding: 1.5rem 1rem;
    color: var(--ledger-ink-soft);
    font-size: 0.88rem;
  }

  .row {
    display: grid;
    grid-template-columns: minmax(0, 3fr) 1fr 1fr 44px;
    align-items: center;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid rgba(35, 32, 27, 0.08);
    font-size: 0.92rem;
  }
  .row:last-child { border-bottom: none; }
  .item-name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .item-price { color: var(--ledger-wine); }
  .item-avail { color: var(--ledger-red); font-size: 0.85rem; }
  .item-avail.on { color: var(--ledger-green); }
  .kebab {
    background: none;
    border: none;
    color: var(--ledger-ink-soft);
    cursor: pointer;
    justify-self: center;
  }

  .inline-menu {
    display: flex;
    gap: 0.5rem;
    padding: 0.3rem 1rem 0.7rem;
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

  @media (max-width: 500px) {
    .table-head span:nth-child(2),
    .row .item-price {
      display: none;
    }
    .table-head { grid-template-columns: minmax(0, 2fr) 1fr 40px; }
    .row { grid-template-columns: minmax(0, 2fr) 1fr 40px; }
  }
</style>
