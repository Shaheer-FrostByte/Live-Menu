<script>
  import { onMount } from "svelte";
  import { link } from "svelte-spa-router";
  import config from "./config.js";
  import { refreshMenu } from "./data.js";

  let categories = [];
  let items = [];
  let loading = true;
  let error = false;

  onMount(async () => {
    try {
      const data = await refreshMenu();
      categories = data.categories.filter((c) => c.C_avail);
      items = data.items;
    } catch (e) {
      error = true;
    } finally {
      loading = false;
    }
  });

  function itemsFor(catId) {
    return items.filter((i) => i.cat_id === catId && i.I_avail);
  }
</script>

<header>
  <div>
    {#if config.logoPath}
      <img src={config.logoPath} alt="Logo" height="78" width="78" />
    {:else}
      <div class="logo-placeholder">LOGO</div>
    {/if}
    <h1>{config.restaurantName}</h1>
  </div>
  <a href="/login" use:link>Admin</a>
</header>

<nav>
  <p>Order Now</p>
  <p>Contact : {config.phoneNumber}</p>
</nav>

<main>
  {#if loading}
    <p class="status-msg">Loading menu…</p>
  {:else if error}
    <p class="status-msg">Couldn't load the menu. Please try again shortly.</p>
  {:else if categories.length === 0}
    <p class="status-msg">Menu coming soon.</p>
  {:else}
    {#each categories as cat (cat.C_id)}
      <fieldset class="categories">
        <legend>{cat.C_name}</legend>
        {#each itemsFor(cat.C_id) as item (item.I_id)}
          <div>
            <p>{item.I_name}</p>
            <p>Rs {item.I_price}</p>
          </div>
        {/each}
      </fieldset>
    {/each}
  {/if}

  <a href="tel:{config.phoneNumber}" class="floating-order">Order Now</a>
</main>

<footer>
  <a target="_blank" rel="noopener" href={config.mapsUrl}>Visit Us!</a>
</footer>

<style>
  :global(html),
  :global(body) {
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    font-size: 18px;
    background-color: #f9f9f9;
    color: #333;
  }
  :global(body) {
    display: flex;
    flex-direction: column;
  }

  header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    flex-wrap: wrap;
    gap: 10px;
  }
  header > div {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  .logo-placeholder {
    width: 78px;
    height: 78px;
    border-radius: 50%;
    background: #eee;
    border: 1px dashed #bbb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    color: #999;
    flex-shrink: 0;
  }
  header h1 {
    font-size: 2.2rem;
    color: #2c3e50;
    margin: 0;
  }
  header a {
    background-color: #e74c3c;
    color: #fff;
    border: none;
    padding: 12px 20px;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: bold;
    text-decoration: none;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    cursor: pointer;
  }
  header a:hover {
    background-color: #c0392b;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }
  header a:active {
    background-color: #a93226;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    transform: translateY(1px);
  }

  .floating-order {
    position: fixed;
    bottom: 60px;
    right: 30px;
    background-color: #e74c3c;
    color: #fff;
    padding: 12px 20px;
    border-radius: 50px;
    text-decoration: none;
    font-size: 1rem;
    font-weight: bold;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    transition: all 0.3s ease;
  }
  .floating-order:hover {
    background-color: #c0392b;
  }

  nav {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 2rem;
    padding: 10px 30px;
    background-color: #ecf0f1;
    border-bottom: 2px solid #bdc3c7;
    font-size: 1.3rem;
  }
  nav p:first-child {
    font-weight: bold;
    color: #e74c3c;
    margin: 0;
  }
  nav p:last-child {
    font-weight: normal;
    margin: 0;
  }

  main {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 15px;
    padding: 20px 30px;
    flex: 1;
  }
  .status-msg {
    grid-column: 1 / -1;
    text-align: center;
    color: #777;
    padding: 2rem 0;
  }

  .categories {
    background-color: #fff;
    padding: 15px;
    height: min-content;
    border-radius: 10px;
    border: 2px solid #bdc3c7;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    font-size: 1rem;
  }
  .categories legend {
    font-size: 1.8rem;
    font-weight: bold;
    color: #2c3e50;
    padding: 0 5px;
  }
  .categories div {
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
    padding: 5px 0;
    border-bottom: 1px solid #ecf0f1;
    align-items: center;
    transition: background-color 0.3s ease;
  }
  .categories div:last-child {
    border-bottom: none;
  }
  .categories div:hover {
    background-color: #f1f2f6;
  }
  .categories p {
    margin: 0;
  }

  footer {
    margin-top: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px 30px;
    background-color: #fff;
    border-top: 2px solid #bdc3c7;
    font-size: 1rem;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
  }
  footer a {
    text-decoration: none;
    color: #2c3e50;
    padding: 5px 10px;
    border-radius: 5px;
    transition: all 0.3s ease;
  }
  footer a:hover {
    background-color: #e74c3c;
    color: #fff;
  }

  @media (max-width: 768px) {
    header h1 {
      font-size: 1.8rem;
    }
    nav {
      gap: 15px;
    }
  }
  @media (max-width: 570px) {
    header {
      flex-direction: column;
    }
  }
  @media (max-width: 500px) {
    .categories div {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
