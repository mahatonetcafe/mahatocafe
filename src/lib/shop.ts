// Public facts from the shop's Google Business profile (read 6 Nov 2026).
// Update the rating here now and then; phone, address and hours live in Admin > Settings.

const MAPS_QUERY = "Mahato Net Cafe, Baliapur Sindri Road, Baliapur, Dhanbad, Jharkhand 828201";

export const SHOP = {
  rating: 4.8,
  reviews: 58,
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAPS_QUERY)}`,
  mapsEmbed: `https://www.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&output=embed`,
  facebook: "https://www.facebook.com/mahatonetcafe",
  instagram: "https://www.instagram.com/mahatonetcafe",
};
