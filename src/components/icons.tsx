import {
  Banknote, BookUser, Car, ClipboardList, CreditCard, FileBadge, FileText, Fingerprint, Gift,
  GraduationCap, HeartPulse, Landmark, Plane, Printer, Receipt, ShieldCheck, ShoppingBasket, Sparkles, Store,
  Vote, Zap, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Banknote, BookUser, Car, ClipboardList, CreditCard, FileBadge, FileText, Fingerprint, Gift,
  GraduationCap, HeartPulse, Landmark, Plane, Printer, Receipt, ShieldCheck, ShoppingBasket, Sparkles, Store,
  Vote, Zap,
};

export const ICON_NAMES = Object.keys(ICONS);

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} aria-hidden />;
}
