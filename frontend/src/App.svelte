<script>
  import Router from "svelte-spa-router";
  import MenuPage from "./MenuPage.svelte";
  import LoginPage from "./LoginPage.svelte";
  import AdminPage from "./Admin/AdminPage.svelte";

  const routes = {
    "/": MenuPage,
    "/login": LoginPage,
    "/admin": AdminPage,
  };
</script>

<Router {routes} />
