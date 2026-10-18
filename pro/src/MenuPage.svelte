<script>
  import { onMount, tick } from "svelte";
  import { link } from "svelte-spa-router";
  import config from "./config.js";
  import { refreshMenu } from "./data.js";

  // ── Data ───────────────────────────────────────────────────────
  let categories = [];
  let items = [];
  let loading = true;
  let error = false;

  onMount(async () => {
    measure();
    frame();
    try {
      const data = await refreshMenu();
      categories = data.categories.filter((c) => c.C_avail);
      items = data.items;
    } catch (e) {
      error = true;
    } finally {
      loading = false;
    }
    await tick();
    measure();
    frame();
  });

  function itemsFor(catId) {
    return items.filter((i) => i.cat_id === catId && i.I_avail);
  }

  // ── Config helpers ─────────────────────────────────────────────
  // Files in /public are served under Vite's base ("/Live-Menu/"),
  // so every image path from config.js gets that prefix.
  const asset = (p) => (p ? import.meta.env.BASE_URL + p.replace(/^\//, "") : "");
  const initials = config.restaurantName
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const phoneHref = (config.phoneNumber || "").replace(/[^\d+]/g, "");
  const aboutText = config.aboutText ?? [];
  const gallery = config.gallery ?? [];
  const fallbacks = [
    "linear-gradient(135deg,#FFB347,#E3262E)",
    "linear-gradient(135deg,#FFC72C,#D81E1E)",
    "linear-gradient(135deg,#FFD36B,#E8761A)",
    "linear-gradient(135deg,#FF9A5A,#B3261E)",
    "linear-gradient(135deg,#FFE066,#F08A24)",
    "linear-gradient(135deg,#FFB38A,#8E2A1B)",
  ];

  // ── Collapsing hero + sticky bar ───────────────────────────────
  let pageEl, heroEl, logoEl, nameEl, burgerEl, barEl, catsEl, trackEl;
  let drawerOpen = false;
  let stuck = false;
  let activeIdx = -1;

  let FULL = 280, COMPACT = 96, LF = 128, LC = 68, OFFSET = 180;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const beh =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

  // Keep these numbers in sync with the --full / --compact / --bar
  // values in the CSS below (hero 280/96, bar 64 on desktop; 200/72, 48 on phones).
  function measure() {
    const m = window.innerWidth < 700;
    FULL = m ? 200 : 280;
    COMPACT = m ? 72 : 96;
    LF = m ? 92 : 128;
    LC = m ? 54 : 68;
    OFFSET = COMPACT + (barEl ? barEl.offsetHeight : 0) + 12;
  }

  function frame() {
    if (!heroEl) return;
    const y = Math.max(0, window.scrollY);
    const h = Math.max(COMPACT, FULL - y);
    const p = (FULL - h) / (FULL - COMPACT); // 0 = full hero, 1 = collapsed

    heroEl.style.height = h + "px";
    const s = LF + (LC - LF) * p;
    logoEl.style.width = logoEl.style.height = s + "px";
    logoEl.style.fontSize = s * 0.34 + "px";
    logoEl.style.borderWidth = 3 - p * 1.5 + "px";
    nameEl.style.opacity = clamp(1 - p * 2.4, 0, 1);
    nameEl.style.maxHeight = (1 - p) * 90 + "px";
    nameEl.style.marginTop = (1 - p) * 12 + "px";
    burgerEl.style.top = 18 + ((COMPACT - 44) / 2 - 18) * p + "px";

    stuck = barEl.getBoundingClientRect().top <= COMPACT + 1;

    // Which category is currently under the bars?
    let c = -1;
    pageEl.querySelectorAll(".cat").forEach((b, i) => {
      if (b.getBoundingClientRect().top <= OFFSET + 24) c = i;
    });
    if (c !== activeIdx) {
      activeIdx = c;
      const chip = catsEl.children[c];
      if (chip) {
        catsEl.scrollTo({
          left: chip.offsetLeft - catsEl.clientWidth / 2 + chip.clientWidth / 2,
          behavior: beh,
        });
      }
    }
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      frame();
    });
  }
  function onResize() {
    measure();
    frame();
  }
  function onKey(e) {
    if (e.key === "Escape") drawerOpen = false;
  }

  // ── Navigation ─────────────────────────────────────────────────
  function goTo(el) {
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - OFFSET + 4,
      behavior: beh,
    });
  }
  function goToCat(id) {
    goTo(document.getElementById("cat-" + id));
  }
  function goSection(target) {
    drawerOpen = false;
    if (target === "top") window.scrollTo({ top: 0, behavior: beh });
    else goTo(document.getElementById(target));
  }
  function scrollGallery(dir) {
    trackEl.scrollBy({ left: dir * 266, behavior: beh });
  }
</script>

<svelte:window on:scroll={onScroll} on:resize={onResize} on:keydown={onKey} />

<div class="page" bind:this={pageEl}>
  <header class="hero" bind:this={heroEl}>
    <button
      class="burger"
      bind:this={burgerEl}
      on:click={() => (drawerOpen = true)}
      aria-label="Open menu"
    >☰</button>
    <div class="ident">
      <div class="logo" bind:this={logoEl}>
        {#if config.logoPath}
          <img src={asset(config.logoPath)} alt="{config.restaurantName} logo" />
        {:else}
          {initials}
        {/if}
      </div>
      <h1 class="name" bind:this={nameEl}>{config.restaurantName}</h1>
    </div>
  </header>
  <div class="spacer"></div>

  <div class="bar" class:stuck bind:this={barEl}>
    <div class="cats" bind:this={catsEl} aria-label="Menu categories">
      {#each categories as cat, i (cat.C_id)}
        <button class="chip" class:on={i === activeIdx} on:click={() => goToCat(cat.C_id)}>
          {cat.C_name}
        </button>
      {/each}
    </div>
  </div>

  <section class="about" id="about">
    <div class="inner">
      {#if config.aboutTitle}<h2>{config.aboutTitle}</h2>{/if}
      {#each aboutText as para}<p>{para}</p>{/each}

      {#if gallery.length}
        <div class="gal">
          <button class="arrow l" on:click={() => scrollGallery(-1)} aria-label="Previous">‹</button>
          <div class="track" bind:this={trackEl}>
            {#each gallery as g, i}
              <figure class="card">
                <div class="ph" style={g.image ? "" : `background:${fallbacks[i % fallbacks.length]}`}>
                  {#if g.image}
                    <img src={asset(g.image)} alt={g.name} loading="lazy" />
                  {:else}
                    <span>{g.name.charAt(0)}</span>
                  {/if}
                </div>
                <figcaption>{g.name}</figcaption>
              </figure>
            {/each}
          </div>
          <button class="arrow r" on:click={() => scrollGallery(1)} aria-label="Next">›</button>
        </div>
      {/if}
    </div>
  </section>

  <section class="menu" id="menu">
    <div class="inner">
      <h2 class="big">Menu</h2>
      {#if loading}
        <p class="status-msg">Loading menu…</p>
      {:else if error}
        <p class="status-msg">Couldn't load the menu. Please try again shortly.</p>
      {:else if categories.length === 0}
        <p class="status-msg">Menu coming soon.</p>
      {:else}
        {#each categories as cat (cat.C_id)}
          <div class="cat" id="cat-{cat.C_id}">
            <h3>{cat.C_name}</h3>
            <ul>
              {#each itemsFor(cat.C_id) as item (item.I_id)}
                <li>
                  <span class="n">{item.I_name}</span>
                  <span class="d"></span>
                  <span class="p">Rs {item.I_price}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      {/if}
    </div>
  </section>

  <section class="contact" id="contact">
    <div class="inner">
      <h2>Find us</h2>
      <div class="cgrid">
        {#if config.address}
          <div>
            <h4>Address</h4>
            <a class="plain" href={config.mapsUrl} target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
              <span>{config.address}</span>
            </a>
          </div>
        {/if}
        {#if config.phoneNumber}
          <div>
            <h4>Call</h4>
            <a class="plain" href="tel:{phoneHref}">
              <svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.6 3.6a1 1 0 0 1-.25 1z"/></svg>
              <span>{config.phoneNumber}</span>
            </a>
          </div>
        {/if}
        {#if config.instagramUrl || config.facebookUrl || config.tiktokUrl}
          <div>
            <h4>Follow</h4>
            {#if config.instagramUrl}
              <a class="plain" href={config.instagramUrl} target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
                <span>Instagram</span>
              </a>
            {/if}
            {#if config.facebookUrl}
              <a class="plain" href={config.facebookUrl} target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24"><path d="M13.5 21v-7.5h2.5l.5-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.7V21h2.8z"/></svg>
                <span>Facebook</span>
              </a>
            {/if}
            {#if config.tiktokUrl}
              <a class="plain" href={config.tiktokUrl} target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24"><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.4a7.35 7.35 0 0 0 4.3 1.38V7.72s-1.88.09-3.24-1.9z"/></svg>
                <span>TikTok</span>
              </a>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </section>

  <footer></footer>
</div>

{#if drawerOpen}
  <button class="scrim" aria-label="Close menu" on:click={() => (drawerOpen = false)}></button>
{/if}
<aside class="drawer" class:open={drawerOpen} aria-label="Site menu">
  <div class="dn">{config.restaurantName}</div>
  <nav>
    <button on:click={() => goSection("top")}>Home</button>
    <button on:click={() => goSection("menu")}>Menu</button>
    <button on:click={() => goSection("contact")}>Contact</button>
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
  /* Kept from the previous MenuPage: the Login/Admin pages rely on these
     (margin reset and the 18px root size that their rem units are based on). */
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

  /* ── Page shell ─────────────────────────────────────────────── */
  .page {
    --full: 280px;
    --compact: 96px; /* 1.5 × --bar */
    --bar: 64px;
    flex: 1;
    font-family: "Figtree", sans-serif;
    font-size: 17px;
    color: #2a1810;
    background: #fff;
  }
  @media (max-width: 699px) {
    .page {
      --full: 200px;
      --compact: 72px;
      --bar: 48px;
    }
  }
  button {
    font-family: inherit;
    cursor: pointer;
  }
  :focus-visible {
    outline: 3px solid #ffb81c;
    outline-offset: 2px;
  }

  /* ── Hero (fixed; JS shrinks it as you scroll) ──────────────── */
  .hero {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--full);
    z-index: 40;
    overflow: hidden;
    background: linear-gradient(120deg, #e3262e, #ff6a13 62%, #ffb81c);
  }
  .hero::before,
  .hero::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.13);
    pointer-events: none;
  }
  .hero::before {
    width: 340px;
    height: 340px;
    right: -90px;
    top: -150px;
  }
  .hero::after {
    width: 220px;
    height: 220px;
    left: -60px;
    bottom: -130px;
  }
  .ident {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .logo {
    display: grid;
    place-items: center;
    flex: none;
    overflow: hidden;
    width: 128px;
    height: 128px;
    font-size: 43px;
    border-radius: 28%;
    background: #fff;
    color: #e3262e;
    font-family: "Sora", sans-serif;
    font-weight: 800;
    border: 3px solid transparent;
    box-shadow: 0 8px 24px rgba(120, 20, 10, 0.3);
  }
  .logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 6%;
    box-sizing: border-box;
  }
  @media (max-width: 699px) {
    .logo {
      width: 92px;
      height: 92px;
      font-size: 31px;
    }
  }
  .name {
    margin: 0;
    max-width: calc(100vw - 32px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.1;
    padding-bottom: 4px;
    font-family: "Sora", sans-serif;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #fff;
    font-size: clamp(34px, 7vw, 62px);
  }
  .burger {
    position: absolute;
    left: 16px;
    top: 18px;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 12px;
    font-size: 22px;
    z-index: 2;
    background: #fff;
    color: #e3262e;
  }
  .spacer {
    height: var(--full);
  }

  /* ── Category bar ───────────────────────────────────────────── */
  .bar {
    position: sticky;
    top: var(--compact);
    z-index: 30;
    height: var(--bar);
    background: #fff;
    border-bottom: 1px solid #f3dfd0;
  }
  .bar.stuck {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
  }
  .cats {
    display: flex;
    gap: 8px;
    height: 100%;
    align-items: center;
    overflow-x: auto;
    padding: 0 16px;
    scrollbar-width: none;
  }
  .cats::-webkit-scrollbar {
    display: none;
  }
  .cats::before,
  .cats::after {
    content: "";
    margin: auto;
  }
  .chip {
    flex: none;
    border: 0;
    white-space: nowrap;
    background: #fff1e6;
    color: #2a1810;
    padding: 8px 18px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 700;
  }
  .chip:hover:not(.on) {
    filter: brightness(0.95);
  }
  .chip.on {
    background: linear-gradient(120deg, #ff6a13, #e3262e);
    color: #fff;
  }

  .inner {
    max-width: 880px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* ── About + carousel ───────────────────────────────────────── */
  .about {
    background: #1f130e;
    color: #e9d5c2;
    padding: 72px 0 64px;
  }
  .about h2 {
    font-family: "Sora", sans-serif;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #fff;
    font-size: clamp(28px, 4.4vw, 44px);
    margin: 0 0 18px;
    line-height: 1.12;
  }
  .about p {
    font-size: 19px;
    line-height: 1.75;
    margin: 0;
    max-width: 62ch;
  }
  .about p + p {
    margin-top: 1em;
  }
  .gal {
    position: relative;
    margin-top: 44px;
  }
  .track {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    padding-bottom: 4px;
  }
  .track::-webkit-scrollbar {
    display: none;
  }
  .card {
    flex: 0 0 min(250px, 68vw);
    margin: 0;
    scroll-snap-align: start;
  }
  .ph {
    aspect-ratio: 4 / 5;
    display: grid;
    place-items: center;
    overflow: hidden;
    border-radius: 22px;
    font-size: 84px;
    font-family: "Sora", sans-serif;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.85);
  }
  .ph img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .card figcaption {
    margin-top: 12px;
    font-weight: 700;
    color: #ffb81c;
    font-size: 17px;
  }
  .arrow {
    position: absolute;
    top: 38%;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 0;
    font-size: 20px;
    font-weight: 700;
    background: #fff;
    color: #e3262e;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  }
  .arrow.l {
    left: -14px;
  }
  .arrow.r {
    right: -14px;
  }
  @media (max-width: 699px) {
    .arrow {
      display: none;
    }
  }

  /* ── Menu ───────────────────────────────────────────────────── */
  .menu {
    background: #fff6ee;
    padding: 72px 0 56px;
  }
  .menu h2.big {
    font-family: "Sora", sans-serif;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #2a1810;
    font-size: clamp(52px, 10vw, 104px);
    line-height: 1;
    margin: 0 0 36px;
  }
  .status-msg {
    text-align: center;
    color: #7a6a5e;
    padding: 2rem 0;
    margin: 0;
  }
  .cat {
    margin-bottom: 44px;
  }
  .cat h3 {
    display: inline-block;
    font-family: "Sora", sans-serif;
    font-weight: 800;
    letter-spacing: -0.02em;
    font-size: clamp(24px, 3vw, 32px);
    color: #e3262e;
    margin: 0 0 8px;
    line-height: 1.15;
    background: linear-gradient(transparent 62%, rgba(255, 184, 28, 0.5) 62%);
  }
  .cat ul {
    list-style: none;
    padding: 0;
    margin: 8px 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
    gap: 0 44px;
  }
  .cat li {
    display: flex;
    align-items: baseline;
    padding: 12px 0;
  }
  .n {
    font-weight: 600;
    font-size: 18px;
  }
  .d {
    flex: 1;
    min-width: 16px;
    border-bottom: 2px dotted rgba(42, 24, 16, 0.3);
    margin: 0 10px;
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

  /* ── Contact ────────────────────────────────────────────────── */
  .contact {
    background: #fff;
    padding: 72px 0 64px;
  }
  .contact h2 {
    font-family: "Sora", sans-serif;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #2a1810;
    font-size: clamp(36px, 6vw, 64px);
    margin: 0 0 32px;
    line-height: 1;
  }
  .cgrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 32px;
  }
  .cgrid h4 {
    margin: 0 0 8px;
    font-size: 15px;
    font-weight: 700;
    color: #ff6a13;
  }
  /* Links look like plain text; the small icon is the only hint they're tappable. */
  a.plain {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 8px 0;
    color: inherit;
    text-decoration: none;
    font-size: 18px;
    line-height: 1.4;
  }
  a.plain svg {
    width: 22px;
    height: 22px;
    flex: none;
    margin-top: 2px;
    fill: #ff6a13;
  }
  a.plain:hover {
    color: #ff6a13;
  }

  footer {
    height: 48px;
    background: radial-gradient(rgba(255, 255, 255, 0.14) 1.5px, transparent 1.5px) 0 0 / 18px 18px, #2a1810;
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
    margin: 4px 8px 28px;
  }
  .drawer nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .drawer nav button {
    background: none;
    border: 0;
    color: #2a1810;
    text-align: left;
    font-size: 20px;
    font-weight: 700;
    padding: 14px 16px;
    border-radius: 12px;
  }
  .drawer nav button:hover {
    background: #fff1e6;
    color: #e3262e;
  }
  .admin {
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

  /* ── WhatsApp button (a bit higher and slightly further from the corner) ── */
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
    .drawer {
      transition: none;
    }
  }
</style>
