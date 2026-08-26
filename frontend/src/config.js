// ── Frostbyte Live Menu — Customization File ──────────────────────
// Everything specific to ONE restaurant lives here. To deploy this
// site for a different client, this is the only file you should
// need to edit.

export default {
  // Display name shown in the header / login / admin pages
  restaurantName: "Cuisine Mall",

  // Small line under the name (menu page) — leave "" to hide
  tagline: "All the cuisines you want.",

  // Logo: put the image file in /public and point to it here.
  // Leave null to show a plain text placeholder box instead.
  logoPath: "/a.png", // e.g. "/logo.png"

  // Phone number used by the "Call" button. Include country code,
  // digits only work best for the tel: link (e.g. "10123456789").
  phoneNumber: "10123456789",

  // Google Maps link for the "Directions" / "Visit Us" button.
  mapsUrl: "https://maps.google.com/",

  // Backend API base URL (no trailing slash). Safe to hardcode —
  // this is a public client-side value, not a secret.
  backendUrl: "https://live-menu-production-020a.up.railway.app",
};
