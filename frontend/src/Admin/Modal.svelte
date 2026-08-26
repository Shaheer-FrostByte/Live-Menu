<script>
  import { createEventDispatcher } from "svelte";
  import { api } from "../data.js";

  export let kind; // "item" | "category"
  export let mode; // "add" | "edit"
  export let initial = {}; // { id, name, avail, price }
  export let catId = null; // required when kind === "item" && mode === "add"

  const dispatch = createEventDispatcher();

  let name = initial.name ?? "";
  let avail = initial.avail ?? true;
  let price = initial.price ?? "";
  let nameError = "";
  let priceError = "";
  let serverError = "";
  let saving = false;

  function close() {
    dispatch("close");
  }

  async function save() {
    nameError = "";
    priceError = "";
    serverError = "";

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      nameError = "Must be at least 2 characters.";
      return;
    }
    if (kind === "item") {
      if (price === "" || isNaN(price)) {
        priceError = "Price must be a number.";
        return;
      }
      if (Number(price) <= 0 || Number(price) > 50000) {
        priceError = "Price must be between 1 and 50,000.";
        return;
      }
    }

    saving = true;
    try {
      if (kind === "category") {
        const payload = { C_name: trimmed, C_avail: avail };
        if (mode === "add") await api.addCategory(payload);
        else await api.updateCategory(initial.id, payload);
      } else {
        const payload = {
          I_name: trimmed,
          I_price: Number(price),
          I_avail: avail,
        };
        if (mode === "add") await api.addItem({ ...payload, cat_id: catId });
        else await api.updateItem(initial.id, payload);
      }
      dispatch("saved");
    } catch (e) {
      serverError = "Something went wrong. Please try again.";
    } finally {
      saving = false;
    }
  }
</script>

<div class="backdrop" on:click|self={close}>
  <div class="modal">
    <div class="modal-header">
      <h3>
        {mode === "add" ? "Add" : "Edit"}
        {kind === "item" ? "Item" : "Category"}
      </h3>
      <button class="close-btn" on:click={close} aria-label="Close">✕</button>
    </div>

    <div class="modal-body">
      {#if serverError}<p class="toast">{serverError}</p>{/if}

      <div class="field">
        <label for="m-name">{kind === "item" ? "Item Name" : "Category Name"}</label>
        <input id="m-name" type="text" bind:value={name} class:err={nameError} />
        {#if nameError}<span class="field-error">{nameError}</span>{/if}
      </div>

      {#if kind === "item"}
        <div class="field">
          <label for="m-price">Price</label>
          <input id="m-price" type="text" bind:value={price} class:err={priceError} />
          {#if priceError}<span class="field-error">{priceError}</span>{/if}
        </div>
      {/if}

      <div class="field field-inline">
        <label for="m-avail">Available</label>
        <input id="m-avail" type="checkbox" bind:checked={avail} />
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" on:click={close}>Cancel</button>
      <button class="btn-primary" on:click={save} disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 500;
  }
  .modal {
    width: 100%;
    max-width: 400px;
    background: var(--ledger-paper);
    border: 1px solid rgba(35, 32, 27, 0.2);
    border-radius: 4px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
    font-family: "Inter", sans-serif;
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.25rem;
    border-bottom: 1px solid rgba(35, 32, 27, 0.15);
  }
  .modal-header h3 {
    font-family: "Fraunces", serif;
    font-weight: 500;
    font-size: 1.05rem;
    color: var(--ledger-ink);
    margin: 0;
  }
  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ledger-ink-soft);
    font-size: 0.9rem;
  }
  .modal-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .field label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--ledger-ink-soft);
  }
  .field input[type="text"] {
    background: #fff;
    border: 1px solid rgba(35, 32, 27, 0.25);
    border-radius: 3px;
    padding: 0.55rem 0.7rem;
    font-size: 0.92rem;
    color: var(--ledger-ink);
    outline: none;
  }
  .field input[type="text"]:focus {
    border-color: var(--ledger-wine);
  }
  .field input.err {
    border-color: var(--ledger-red);
  }
  .field-error {
    font-size: 0.72rem;
    color: var(--ledger-red);
  }
  .field-inline {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.55rem 0.7rem;
    background: var(--ledger-paper-edge);
    border-radius: 3px;
  }
  .field-inline label {
    margin: 0;
  }
  .field-inline input {
    width: 16px;
    height: 16px;
    accent-color: var(--ledger-green);
  }
  .toast {
    background: rgba(177, 68, 58, 0.1);
    border: 1px solid rgba(177, 68, 58, 0.3);
    color: var(--ledger-red);
    font-size: 0.82rem;
    padding: 0.6rem 0.8rem;
    border-radius: 3px;
    margin: 0;
  }
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
    padding: 1rem 1.25rem;
    border-top: 1px solid rgba(35, 32, 27, 0.15);
  }
  .btn-primary,
  .btn-secondary {
    font-family: "Inter", sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    padding: 0.55rem 1.15rem;
    border-radius: 3px;
    cursor: pointer;
  }
  .btn-primary {
    background: var(--ledger-wine);
    color: var(--ledger-paper);
    border: none;
  }
  .btn-primary:disabled {
    opacity: 0.6;
    cursor: default;
  }
  .btn-secondary {
    background: none;
    border: 1px solid rgba(35, 32, 27, 0.3);
    color: var(--ledger-ink);
  }
</style>
