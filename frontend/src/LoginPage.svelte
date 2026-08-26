<script>
  import { push } from "svelte-spa-router";
  import config from "./config.js";
  import { api } from "./data.js";

  let email = "";
  let password = "";
  let errorMsg = "";
  let submitting = false;

  async function handleSubmit() {
    errorMsg = "";
    if (!email || !password) {
      errorMsg = "Please enter both email and password.";
      return;
    }
    submitting = true;
    try {
      await api.login(email, password);
      push("/admin");
    } catch (e) {
      errorMsg = "Invalid email or password.";
    } finally {
      submitting = false;
    }
  }
</script>

<main>
  <div class="card">
    <div class="crest">LOGO</div>
    <h1>{config.restaurantName}</h1>
    <p class="subtitle">Admin Sign In</p>

    <form on:submit|preventDefault={handleSubmit}>
      <label>
        Email
        <input type="email" bind:value={email} autocomplete="username" />
      </label>
      <label>
        Password
        <input
          type="password"
          bind:value={password}
          autocomplete="current-password"
        />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign In"}
      </button>
    </form>

    {#if errorMsg}
      <p class="error">{errorMsg}</p>
    {/if}
  </div>
</main>

<style>
  main {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ledger-paper-edge);
    padding: 1.5rem;
  }

  .card {
    width: 100%;
    max-width: 380px;
    background: var(--ledger-paper);
    border: 1px solid rgba(35, 32, 27, 0.15);
    border-radius: 4px;
    padding: 2.5rem 2rem;
    text-align: center;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  }

  .crest {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--ledger-paper-edge);
    border: 1px solid rgba(35, 32, 27, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    font-family: "Fraunces", serif;
    font-size: 0.65rem;
    color: var(--ledger-ink-soft);
  }

  h1 {
    font-family: "Fraunces", serif;
    font-weight: 500;
    font-size: 1.6rem;
    color: var(--ledger-ink);
    margin: 0;
  }

  .subtitle {
    margin: 0.4rem 0 2rem;
    font-size: 0.72rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--ledger-gold);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    text-align: left;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-family: "Inter", sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ledger-ink-soft);
  }

  input {
    font-family: "Inter", sans-serif;
    font-size: 0.95rem;
    color: var(--ledger-ink);
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(35, 32, 27, 0.3);
    padding: 0.6rem 0.1rem;
    outline: none;
  }
  input:focus {
    border-bottom-color: var(--ledger-wine);
  }

  button {
    margin-top: 0.5rem;
    background: var(--ledger-wine);
    color: var(--ledger-paper);
    border: none;
    border-radius: 2px;
    padding: 0.85rem 1.5rem;
    font-family: "Inter", sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  button:hover:not(:disabled) {
    background: var(--ledger-wine-dark);
  }
  button:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .error {
    margin-top: 1.25rem;
    font-family: "Inter", sans-serif;
    font-size: 0.82rem;
    color: var(--ledger-red);
  }
</style>
