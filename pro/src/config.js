// ── Frostbyte Live Menu — Customization File ──────────────────────
// Everything specific to ONE restaurant lives here. To deploy this
// site for a different client, this is the only file you should
// need to edit.

export default {
  // Display name shown in the header / login / admin pages
  restaurantName: "Cuisine Mall",

  // Small line under the name — kept for later use (the new menu page
  // header shows only the logo and name).
  tagline: "All the cuisines you want.",

  // Logo: put the image file in /public and point to it here.
  // Leave null to show the restaurant's initials instead.
  logoPath: "logo.png", // e.g. "logo.png"

  // ── About section (menu page) ───────────────────────────────────
  // Heading + paragraphs. Each string in the array is one paragraph.
  // Mention your cuisines and city here — it's the main text search
  // engines will read.
  aboutTitle: "Every cuisine, one table",
  aboutText: [
    "Cuisine Mall is a family restaurant in Karachi serving juicy burgers, stone-baked pizza, slow-cooked biryani, charcoal BBQ, fresh shakes and desserts, all under one roof.",
    "Dine in, take away, or send us your order on WhatsApp.",
  ],

  // Photo carousel under the about text. Put the image files in
  // /public (e.g. /public/gallery/zinger.jpg) and list them here as
  // "gallery/zinger.jpg". Leave image: "" to show a colored placeholder.
  gallery: [
    { image: "gallery/zinger.jpg", name: "Zinger Burger" },
    { image: "gallery/pizza.jpg", name: "Chicken Tikka Pizza" },
    { image: "gallery/biryani.jpg", name: "Chicken Biryani" },
    { image: "gallery/tikka.jpg", name: "Seekh Kabab" },
    { image: "gallery/french_fries.jpg", name: "Loaded Fries" },
    { image: "gallery/sundae.jpg", name: "Brownie Sundae" },
  ],

  // ── Contact section (menu page) ─────────────────────────────────
  // Leave any of these as "" to hide it.
  address: "Shop 12, Food Street, Clifton, Karachi",
  phoneNumber: "+92 303-1234567", // shown, and used for the tap-to-call link
  instagramUrl: "",
  facebookUrl: "",
  tiktokUrl: "",

  // WhatsApp number for the floating chat button: country code,
  // digits only (e.g. "10123456789").
  whatsappNumber: "923031234567",

  // Google Maps link — opened when the address is tapped.
  mapsUrl: "https://maps.google.com/",

};
