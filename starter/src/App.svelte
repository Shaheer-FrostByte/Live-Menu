<script>
  import Router from "svelte-spa-router";
  import config from "./config.js";
  import StarterMenu from "./StarterMenu.svelte";
  import LoginPage from "./LoginPage.svelte";
  import AdminPage from "./Admin/AdminPage.svelte";

  const routes = {
    // "/" shows whichever UI the client's plan in config.js selects.
    "/": config.plan === "premium" ? PremiumMenu : StarterMenu,
    // Demo-only: lets visitors open both UIs directly.
    "/starter": StarterMenu,
    "/login": LoginPage,
    "/admin": AdminPage,
  };
</script>

<Router {routes} />
