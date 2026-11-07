import { Camera, CheckCircle2, Download, ListChecks, Smartphone } from "lucide-react";
import Image from "next/image";
import { AppButtons, type AppLinks } from "./AppButtons";
import { CategoryIcon } from "./icons";

const FEATURES = [
  { icon: Camera, text: "Camera se seedhe document ki photo" },
  { icon: ListChecks, text: "Apne order ka status ek nazar me" },
  { icon: Download, text: "Apni receiving ek tap me download" },
];

type Tile = { id: number; name: string; icon: string };

function Phone({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`w-44 sm:w-48 rounded-[1.75rem] bg-[#0d0b2b] p-1.5 shadow-lift ${className ?? ""}`}>
      <div className="h-[20rem] overflow-hidden rounded-[1.4rem] bg-white">{children}</div>
    </div>
  );
}

/** Mock-ups are drawn in HTML from real categories, so they never go out of date. */
export function AppSection({ tiles, links }: { tiles: Tile[]; links: AppLinks }) {
  return (
    <section className="container-x pb-10">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-[#23198a] to-brand-500 text-white">
        <div className="grid gap-6 p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1 text-xs font-bold tracking-wide">
              <Smartphone className="size-3.5" aria-hidden /> ANDROID APP
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold leading-tight">
              Mahato Net Cafe, ab aapke mobile me
            </h2>
            <p className="mt-2 max-w-md text-white/85">
              Saari services, order tracking aur receiving ek hi app me.
            </p>
            <ul className="mt-4 space-y-2.5">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/15">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <AppButtons links={links} />
            </div>
          </div>

          <div className="relative mx-auto flex justify-center" aria-hidden>
            <Phone className="relative z-10 -rotate-3">
              <div className="flex items-center gap-1.5 border-b border-line px-2 py-1.5">
                <Image src="/logo.png" alt="" width={30} height={25} className="h-6 w-auto" />
                <span className="text-[10px] font-bold text-brand-900">Mahato Net Cafe</span>
              </div>
              <div className="bg-brand-50 p-2">
                <p className="text-[11px] font-bold leading-tight text-brand-900">Har online kaam, ab ghar baithe</p>
                <p className="mt-1.5 rounded-full border border-brand-200 bg-white px-2 py-1 text-[9px] text-muted">Service dhundhein…</p>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-2">
                {tiles.map((t) => (
                  <div key={t.id} className="text-center">
                    <span className="grid h-9 place-items-center rounded-lg border border-line bg-tile">
                      <CategoryIcon name={t.icon} className="size-4 text-brand-600" />
                    </span>
                    <span className="mt-0.5 block truncate text-[8px] text-ink">{t.name}</span>
                  </div>
                ))}
              </div>
              <div className="mx-2 rounded-lg bg-gradient-to-r from-brand-900 to-brand-500 p-2 text-white">
                <p className="text-[9px] font-bold">Apna order track karein</p>
                <p className="text-[8px] text-white/80">Receiving yahin milegi</p>
              </div>
            </Phone>

            <Phone className="relative z-0 ml-3 mt-8 hidden rotate-3 sm:block">
              <div className="border-b border-line px-2 py-2 text-[11px] font-bold text-brand-900">My Orders</div>
              <div className="space-y-2 p-2">
                <div className="rounded-lg border border-line p-2">
                  <p className="text-[10px] font-bold text-brand-900">New PAN Card</p>
                  <div className="mt-1.5 flex items-center gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className="h-1 flex-1 rounded-full bg-brand-500" />
                    ))}
                    <span className="h-1 flex-1 rounded-full bg-line" />
                  </div>
                  <p className="mt-1 text-[8px] font-bold text-emerald-700">Receiving ready</p>
                </div>
                <div className="flex items-center justify-center gap-1 rounded-lg bg-accent-500 py-1.5 text-[9px] font-bold text-white">
                  <Download className="size-3" /> Receiving download
                </div>
                <div className="rounded-lg border border-line p-2">
                  <p className="text-[10px] font-bold text-brand-900">Income Certificate</p>
                  <p className="mt-0.5 text-[8px] font-semibold text-indigo-800">Kaam chal raha</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 p-2 text-[8px] font-semibold text-emerald-800">
                  <CheckCircle2 className="size-3.5 shrink-0" /> Aapki receiving aa gayi
                </div>
              </div>
            </Phone>
          </div>
        </div>
      </div>
    </section>
  );
}
