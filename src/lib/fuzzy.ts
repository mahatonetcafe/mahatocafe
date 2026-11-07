// Typo-tolerant search, shared by the browser suggestions and the /search page.
// Written for how customers actually type: "adhar", "pen card", "votar id", "pasport".

const words = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

/** "aadhaar" and "adhar" become the same word. */
const squash = (w: string) => w.replace(/(.)\1+/g, "$1");

/** Edit distance counting a swap of two neighbours as one typo. */
function distance(a: string, b: string) {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

const allowedTypos = (len: number) => (len <= 2 ? 0 : len <= 4 ? 1 : len <= 7 ? 2 : 3);

/** 0 means the same word; below 1 means no real typo; Infinity means no match. */
function wordCost(query: string, token: string) {
  if (query === token) return 0;
  if (query.length >= 2 && token.startsWith(query)) return 0.2;
  const q = squash(query);
  const t = squash(token);
  if (q === t) return 0.1;
  // People rarely get the first letter of a short word wrong: keeps "kaam" from matching "naam".
  if (query.length <= 4 && q[0] !== t[0]) return Infinity;
  // A wrong first letter uses up the whole allowance: "adhar" must not match "sudhar".
  const limit = q[0] === t[0] ? allowedTypos(query.length) : 1;
  if (Math.abs(q.length - t.length) > limit) return Infinity;
  const d = distance(q, t);
  return d <= limit ? d : Infinity;
}

export type SearchEntry<T> = { item: T; title: string[]; other: string[] };

export function buildIndex<T>(items: T[], title: (t: T) => string, other: (t: T) => string): SearchEntry<T>[] {
  return items.map((item) => {
    const t = words(title(item));
    // "pancard" should find "PAN Card": joined neighbours count as words too.
    const joined = t.slice(1).map((w, i) => t[i] + w);
    return { item, title: [...t, ...joined], other: words(other(item)) };
  });
}

export type SearchHit<T> = { item: T; exact: boolean };

export function fuzzySearch<T>(index: SearchEntry<T>[], query: string): SearchHit<T>[] {
  const queryWords = words(query);
  if (!queryWords.length) return [];

  const scored = index.flatMap((e) => {
    let score = 0;
    let worst = 0;
    let matched = 0;
    for (const q of queryWords) {
      const best = Math.min(
        ...e.title.map((t) => wordCost(q, t)),
        ...e.other.map((t) => wordCost(q, t) + 0.5),
      );
      if (best !== Infinity) {
        score += best;
        worst = Math.max(worst, best);
        matched++;
      }
    }
    return matched ? [{ item: e.item, score, worst, matched }] : [];
  });

  // Prefer results matching every word. Otherwise "pan card banana hai" would find nothing.
  const all = scored.filter((s) => s.matched === queryWords.length);
  const pool = all.length ? all : scored;
  return pool
    .sort((a, b) => b.matched - a.matched || a.score - b.score)
    .map((s) => ({ item: s.item, exact: s.matched === queryWords.length && s.worst < 1 }));
}
