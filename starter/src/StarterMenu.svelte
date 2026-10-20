<script>
  import { onMount } from "svelte";
  import { link } from "svelte-spa-router";
  import config from "./config.js";
  import { refreshMenu } from "./data.js";

  // ── Data ───────────────────────────────────────────────────────
  let categories = [];
  let items = [];
  let loading = true;
  let error = false;

  async function loadMenu() {
    try {
      const data = await refreshMenu();
      categories = data.categories.filter((c) => c.C_avail);
      items = data.items;
    } catch (e) {
      error = true;
    } finally {
      loading = false;
    }
  }

  function itemsFor(catId) {
    return items.filter((i) => i.cat_id === catId && i.I_avail);
  }

  // ── Config helpers ─────────────────────────────────────────────
  // Files in /public are served under Vite's base path, so image paths get that prefix.
  const asset = (p) => (p ? import.meta.env.BASE_URL + p.replace(/^\//, "") : "");
  const initials = config.restaurantName
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // ── Sticky strip, drawer, scroll-spy ───────────────────────────
  const STRIP = 56; // height of the sticky strip (px)
  const OFFSET = STRIP + 16; // where a category lands when you tap it

  let pageEl, heroEl;
  let showStrip = false; // true once the hero has scrolled out of view
  let drawerOpen = false;
  let activeIdx = -1;

  const beh =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

  onMount(() => {
    const io = new IntersectionObserver(([e]) => (showStrip = !e.isIntersecting));
    io.observe(heroEl);
    loadMenu();
    return () => io.disconnect();
  });

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      let c = -1;
      pageEl.querySelectorAll(".cat").forEach((b, i) => {
        if (b.getBoundingClientRect().top <= OFFSET + 24) c = i;
      });
      activeIdx = c;
    });
  }
  function onKey(e) {
    if (e.key === "Escape") drawerOpen = false;
  }

  function goToCat(id) {
    drawerOpen = false;
    const el = document.getElementById("cat-" + id);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - OFFSET + 4,
      behavior: beh,
    });
  }
</script>

<svelte:window on:scroll={onScroll} on:keydown={onKey} />

<div class="page" bind:this={pageEl}>
  <header class="hero" bind:this={heroEl}>
    <button class="burger" on:click={() => (drawerOpen = true)} aria-label="Open menu">☰</button>
    <div class="logo hero-logo" class:has-img={config.logoPath}>
      {#if config.logoPath}
        <img src={asset(config.logoPath)} alt="{config.restaurantName} logo" />
      {:else}
        {initials}
      {/if}
    </div>
    <h1>{config.restaurantName}</h1>
  </header>

  <main class="menu">
    <div class="inner">
      {#if loading}
        <p class="status-msg">Loading menu…</p>
      {:else if error}
        <p class="status-msg">Couldn't load the menu. Please try again shortly.</p>
      {:else if categories.length === 0}
        <p class="status-msg">Menu coming soon.</p>
      {:else}
        {#each categories as cat (cat.C_id)}
          <section class="cat" id="cat-{cat.C_id}">
            <h2>{cat.C_name}</h2>
            <ul>
              {#each itemsFor(cat.C_id) as item (item.I_id)}
                <li>
                  <span class="n">{item.I_name}</span>
                  <span class="d"></span>
                  <span class="p">Rs {item.I_price}</span>
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      {/if}
    </div>
  </main>

  <footer>
    {#if config.mapsUrl}<a href={config.mapsUrl} target="_blank" rel="noopener">Visit Us</a>{/if}
    {#if config.instagramUrl}<a href={config.instagramUrl} target="_blank" rel="noopener">Instagram</a>{/if}
    {#if config.facebookUrl}<a href={config.facebookUrl} target="_blank" rel="noopener">Facebook</a>{/if}
    {#if config.tiktokUrl}<a href={config.tiktokUrl} target="_blank" rel="noopener">TikTok</a>{/if}
  </footer>
</div>

<!-- Sticky strip: appears once the hero is out of view -->
<div class="strip" class:show={showStrip}>
  <button class="burger" on:click={() => (drawerOpen = true)} aria-label="Open menu">☰</button>
  <div class="logo strip-logo" class:has-img={config.logoPath}>
    {#if config.logoPath}
      <img src={asset(config.logoPath)} alt="{config.restaurantName} logo" />
    {:else}
      {initials}
    {/if}
  </div>
</div>

{#if drawerOpen}
  <button class="scrim" aria-label="Close menu" on:click={() => (drawerOpen = false)}></button>
{/if}
<aside class="drawer" class:open={drawerOpen} aria-label="Menu categories">
  <div class="dn">{config.restaurantName}</div>
  <nav>
    {#each categories as cat, i (cat.C_id)}
      <button class:on={i === activeIdx} on:click={() => goToCat(cat.C_id)}>{cat.C_name}</button>
    {/each}
  </nav>
  <a class="admin" href="/login" use:link>Admin</a>
</aside>

<a
  target="_blank"
  rel="noopener"
  href="https://wa.me/{config.whatsappNumber}"
  class="floating-whatsapp"
  aria-label="Chat on WhatsApp"
>
  <svg viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38c1.44.79 3.06 1.2 4.72 1.2h.02c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.1h-.01c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.15 8.15 0 0 1-1.26-4.32c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.55-3.7 8.18-8.18 8.18zm4.52-6.13c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.02 2.57.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.23-.17-.48-.29z"/></svg>
</a>

<style>
  /* Same global rules as the premium page (Login/Admin rely on them). */
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
  :global(#app) {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .page {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-family: "Figtree", sans-serif;
    font-size: 17px;
    color: #2a1810;
    background: #fff6ee;
  }
  button {
    font-family: inherit;
    cursor: pointer;
  }
  :focus-visible {
    outline: 3px solid #ffb81c;
    outline-offset: 2px;
  }

  /* ── Hero ───────────────────────────────────────────────────── */
  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 26px 16px 30px;
    background: linear-gradient(120deg, #e3262e, #ff6a13 62%, #ffb81c);
    border-radius: 0 0 32px 32px; /* square top, rounded bottom corners */
  }
  .hero h1 {
    margin: 0;
    max-width: 100%;
    text-align: center;
    font-family: "Sora", sans-serif;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.1;
    color: #fff;
    font-size: clamp(28px, 6vw, 46px);
  }
  .burger {
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 12px;
    font-size: 22px;
  }
  .hero .burger {
    position: absolute;
    left: 16px;
    top: 16px;
    background: #fff;
    color: #e3262e;
  }

  .logo {
    display: grid;
    place-items: center;
    flex: none;
    overflow: hidden;
    border-radius: 28%;
    font-family: "Sora", sans-serif;
    font-weight: 800;
  }
  .logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 6%;
    box-sizing: border-box;
  }
  .hero-logo {
    width: 72px;
    height: 72px;
    font-size: 25px;
    background: #fff;
    color: #e3262e;
    box-shadow: 0 6px 18px rgba(120, 20, 10, 0.3);
  }
  @media (max-width: 699px) {
    .hero-logo {
      width: 60px;
      height: 60px;
      font-size: 21px;
    }
  }

  /* ── Sticky strip (shown when the hero is gone) ─────────────── */
  .strip {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 56px;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-bottom: 1px solid #f3dfd0;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    transform: translateY(-100%);
    visibility: hidden;
    transition: transform 0.25s ease, visibility 0s linear 0.25s;
  }
  .strip.show {
    transform: none;
    visibility: visible;
    transition-delay: 0s;
  }
  .strip .burger {
    position: absolute;
    left: 12px;
    top: 6px;
    background: #fff1e6;
    color: #e3262e;
  }
  .strip-logo {
    width: 38px;
    height: 38px;
    font-size: 13px;
    background: linear-gradient(120deg, #ff6a13, #e3262e);
    color: #fff;
  }
  .strip-logo.has-img {
    background: #fff;
    border: 1px solid #f3dfd0;
  }

  /* ── Menu ───────────────────────────────────────────────────── */
  .menu {
    flex: 1;
    padding: 40px 0 56px;
  }
  .inner {
    max-width: 760px;
    margin: 0 auto;
    padding: 0 20px;
  }
  .status-msg {
    text-align: center;
    color: #7a6a5e;
    padding: 2rem 0;
    margin: 0;
  }
  .cat {
    margin-bottom: 40px;
  }
  .cat h2 {
    margin: 0 0 6px;
    padding-bottom: 8px;
    border-bottom: 2px solid #f3dfd0;
    font-family: "Sora", sans-serif;
    font-weight: 800;
    letter-spacing: -0.02em;
    font-size: 26px;
    color: #e3262e;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li {
    display: flex;
    align-items: baseline;
    padding: 11px 0;
  }
  .n {
    font-weight: 600;
    font-size: 17px;
  }
  .d {
    flex: 1;
    min-width: 16px;
    margin: 0 10px;
    border-bottom: 2px dotted rgba(42, 24, 16, 0.3);
  }
  .p {
    background: #ffe3d0;
    color: #e3262e;
    font-weight: 700;
    font-size: 15px;
    padding: 3px 12px;
    border-radius: 999px;
    white-space: nowrap;
  }

  /* ── Footer (narrow link strip) ─────────────────────────────── */
  footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 24px;
    min-height: 56px;
    padding: 12px 16px;
    background: #2a1810;
    font-size: 14px;
  }
  footer a {
    color: #f3e3d3;
    text-decoration: none;
  }
  footer a:hover {
    color: #ffb81c;
  }

  /* ── Drawer ─────────────────────────────────────────────────── */
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 55;
    border: 0;
    padding: 0;
    background: rgba(0, 0, 0, 0.55);
  }
  .drawer {
    position: fixed;
    inset: 0 auto 0 0;
    width: 280px;
    z-index: 60;
    display: flex;
    flex-direction: column;
    padding: 24px 16px 20px;
    background: #fff;
    color: #2a1810;
    box-shadow: 8px 0 40px rgba(0, 0, 0, 0.2);
    font-family: "Figtree", sans-serif;
    transform: translateX(-100%);
    visibility: hidden;
    transition: transform 0.3s ease, visibility 0s linear 0.3s;
  }
  .drawer.open {
    transform: none;
    visibility: visible;
    transition-delay: 0s;
  }
  .dn {
    font-family: "Sora", sans-serif;
    font-weight: 800;
    font-size: 22px;
    margin: 4px 8px 22px;
  }
  .drawer nav {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .drawer nav button {
    background: none;
    border: 0;
    color: #2a1810;
    text-align: left;
    font-size: 18px;
    font-weight: 600;
    padding: 12px 16px;
    border-radius: 12px;
  }
  .drawer nav button:hover {
    background: #fff1e6;
    color: #e3262e;
  }
  .drawer nav button.on {
    background: #ffe9da;
    color: #e3262e;
    box-shadow: inset 3px 0 0 #ff6a13;
  }
  .admin {
    margin-top: 16px;
    padding: 12px;
    text-align: center;
    border: 2px solid #2a1810;
    border-radius: 999px;
    color: #2a1810;
    font-weight: 700;
    text-decoration: none;
  }
  .admin:hover {
    background: #2a1810;
    color: #fff;
  }

  /* ── WhatsApp button ────────────────────────────────────────── */
  .floating-whatsapp {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 35px;
    right: 25px;
    height: 56px;
    width: 56px;
    border-radius: 50%;
    background-color: #25d366;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    z-index: 20;
  }
  .floating-whatsapp svg {
    width: 28px;
    height: 28px;
    fill: #fff;
  }

  @media (prefers-reduced-motion: reduce) {
    .drawer,
    .strip {
      transition: none;
    }
  }
</style>
