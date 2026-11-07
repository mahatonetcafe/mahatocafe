import type { FinderOption } from "./catalog";

type Named = { name: string; slug: string };

/** Options are saved by service slug, so renaming a service never breaks them. */
export function finderOptionsToText(options: FinderOption[], services: Named[]) {
  return options
    .map((o) => {
      const names = o.picks.map((slug) => services.find((s) => s.slug === slug)?.name).filter(Boolean);
      return `${o.label} | ${names.join(", ")}`;
    })
    .join("\n");
}

/** One option per line: `Jawab | Service ka naam, Doosri service`. */
export function parseFinderOptions(raw: string, services: Named[]): { options: FinderOption[] } | { error: string } {
  const options: FinderOption[] = [];
  for (const line of raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
    const [label, names = ""] = line.split("|").map((p) => p.trim());
    if (!label) return { error: `Is line me jawab nahi hai: ${line}` };
    const picks: string[] = [];
    for (const name of names.split(",").map((n) => n.trim()).filter(Boolean)) {
      const found = services.find((s) => s.name.toLowerCase() === name.toLowerCase());
      if (!found) return { error: `"${name}" naam ki service is category me nahi hai` };
      picks.push(found.slug);
    }
    options.push({ label, picks });
  }
  return { options };
}
