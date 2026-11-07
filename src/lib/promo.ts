// The shop's own software products, promoted to other cafe owners. Prices are left out on
// purpose: offers change often and each product page always has the current rate.

export type PromoProduct = {
  key: string;
  settingKey: string;
  icon: "qr" | "tools" | "phone";
  name: string;
  audience: string;
  summary: string;
  points: string[];
  cta: string;
  note?: string;
};

export const PROMO_PRODUCTS: PromoProduct[] = [
  {
    key: "windows",
    settingKey: "promo_windows_url",
    icon: "qr",
    name: "QR Se Print",
    audience: "PC wali dukan ke liye",
    summary: "Customer QR scan karke file bhejta hai, online pay karta hai, aur print apne aap nikal jata hai.",
    points: ["WhatsApp ya pendrive ki zaroorat nahi", "B&W aur colour print", "Print ke baad file server se delete"],
    cta: "Free demo lein",
  },
  {
    key: "cyber",
    settingKey: "promo_cyber_url",
    icon: "tools",
    name: "Cyber Cafe Solution Software",
    audience: "Har cyber cafe ke liye",
    summary: "Print, scan, PVC card, PDF edit, photo aur signature size, bill aur resume: 20 tools ek hi software me.",
    points: ["Bina internet ke chalta hai", "Monthly fee nahi", "Customer ki file aapke PC se bahar nahi jati"],
    cta: "Software dekhein",
  },
  {
    key: "android",
    settingKey: "promo_android_url",
    icon: "phone",
    name: "QR Se Print Android",
    audience: "Bina PC wali dukan ke liye",
    summary: "USB printer ko OTG se phone me lagayein. Customer QR scan kare aur phone khud print nikale.",
    points: ["Computer ki zaroorat nahi", "Android 7 ya usse naya phone", "Free demo se shuru karein"],
    cta: "Free demo lein",
    note: "Abhi beta testing me",
  },
];

/** Tags a link so qrseprint.in analytics can show which spot on this site sent the visitor. */
export function trackedUrl(url: string, placement: string) {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "mahatonetcafe");
    u.searchParams.set("utm_medium", "website");
    u.searchParams.set("utm_campaign", placement);
    return u.toString();
  } catch {
    return url;
  }
}
