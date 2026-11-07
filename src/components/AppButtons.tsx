import { Download, Users } from "lucide-react";

function PlayLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#00C3FF" d="M3.6 1.8 13.1 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1z" />
      <path fill="#00E676" d="M16.5 8.6 13.1 12 3.6 1.8c.3-.2.7-.1 1 .1l11.9 6.7z" />
      <path fill="#FF3A44" d="M16.5 15.4 4.6 22.1c-.3.2-.7.3-1 .1L13.1 12l3.4 3.4z" />
      <path fill="#FFD600" d="M20.3 10.7c1 .6 1 2 0 2.6l-3.8 2.1L13.1 12l3.4-3.4 3.8 2.1z" />
    </svg>
  );
}

/** A real link once the admin has saved a URL; until then it stays visible but not clickable. */
function MaybeLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
  }
  return <span aria-disabled="true" className={`${className} cursor-not-allowed opacity-60`}>{children}</span>;
}

export type AppLinks = { playUrl: string; beta: boolean; groupUrl: string; betaUrl: string };

const BETA_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-brand-900";

export function AppButtons({ links }: { links: AppLinks }) {
  return (
    <div className="space-y-4">
      {links.beta && (
        <div>
          <p className="text-sm font-bold">Beta testing chal rahi hai</p>
          <p className="text-sm text-white/85">Pehle group join karein, phir beta app download karein.</p>
          <div className="mt-2.5 flex flex-wrap gap-3">
            <MaybeLink href={links.groupUrl} className={BETA_BUTTON}>
              <Users className="size-5" aria-hidden /> 1. Beta Group Join karein
            </MaybeLink>
            <MaybeLink href={links.betaUrl} className={BETA_BUTTON}>
              <Download className="size-5" aria-hidden /> 2. Beta App Download
            </MaybeLink>
          </div>
        </div>
      )}
      <MaybeLink
        href={links.playUrl}
        className="inline-flex items-center gap-3 rounded-lg border border-white/30 bg-black px-4 py-2 text-white"
      >
        <PlayLogo className="size-8 shrink-0" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-medium tracking-wide">GET IT ON</span>
          <span className="block text-lg font-medium">Google Play</span>
        </span>
      </MaybeLink>
    </div>
  );
}
