export type CriterionKey = "harga" | "audio" | "katalog" | "kemudahan" | "fitur";

export type CriterionType = "cost" | "benefit";

export interface Criterion {
  key: CriterionKey;
  no: string;
  label: string;
  question: string;
  type: CriterionType;
}

export const CRITERIA: Criterion[] = [
  {
    key: "harga",
    no: "01",
    label: "Harga berlangganan",
    question: "Seberapa penting harga langganan yang murah?",
    type: "cost",
  },
  {
    key: "audio",
    no: "02",
    label: "Kualitas audio",
    question: "Seberapa penting kualitas suara yang jernih?",
    type: "benefit",
  },
  {
    key: "katalog",
    no: "03",
    label: "Kelengkapan katalog",
    question: "Seberapa penting koleksi lagu yang luas?",
    type: "benefit",
  },
  {
    key: "kemudahan",
    no: "04",
    label: "Kemudahan penggunaan",
    question: "Seberapa penting aplikasi yang intuitif?",
    type: "benefit",
  },
  {
    key: "fitur",
    no: "05",
    label: "Fitur tambahan",
    question: "Seberapa penting playlist, lirik, podcast, dan fitur sosial?",
    type: "benefit",
  },
];

export interface Platform {
  id: string;
  name: string;
  blurb: string;
  values: Record<CriterionKey, number>;
}

/** Nilai alternatif: harga dalam rupiah per bulan (cost), sisanya skala 1-5 (benefit). */
export const PLATFORMS: Platform[] = [
  {
    id: "spotify",
    name: "Spotify",
    blurb: "Katalog raksasa, playlist personal, dan aplikasi yang paling mudah dipakai.",
    values: { harga: 54900, audio: 4, katalog: 5, kemudahan: 5, fitur: 5 },
  },
  {
    id: "youtube-music",
    name: "YouTube Music",
    blurb: "Kuat untuk lagu langka, live session, dan video musik dalam satu aplikasi.",
    values: { harga: 59000, audio: 4, katalog: 5, kemudahan: 4, fitur: 4 },
  },
  {
    id: "apple-music",
    name: "Apple Music",
    blurb: "Kualitas audio lossless dan spatial audio terbaik di kelasnya.",
    values: { harga: 69000, audio: 5, katalog: 4, kemudahan: 4, fitur: 3 },
  },
  {
    id: "joox",
    name: "Joox",
    blurb: "Paling ramah kantong mahasiswa dengan banyak lagu lokal dan karaoke.",
    values: { harga: 49000, audio: 3, katalog: 3, kemudahan: 4, fitur: 3 },
  },
  {
    id: "soundcloud",
    name: "SoundCloud",
    blurb: "Surganya musik indie, remix, dan karya musisi independen.",
    values: { harga: 45000, audio: 3, katalog: 4, kemudahan: 3, fitur: 4 },
  },
];

export type Ratings = Record<CriterionKey, number>;

export interface SawRow {
  platform: Platform;
  normalized: Record<CriterionKey, number>;
  weighted: Record<CriterionKey, number>;
  score: number;
  score100: number;
}

export interface SawResult {
  weights: Record<CriterionKey, number>;
  rows: SawRow[];
  best: SawRow;
  topCriteria: Criterion[];
}

export function computeSaw(ratings: Ratings): SawResult {
  const total = CRITERIA.reduce((sum, c) => sum + (ratings[c.key] || 0), 0) || 1;
  const weights = {} as Record<CriterionKey, number>;
  for (const c of CRITERIA) weights[c.key] = (ratings[c.key] || 0) / total;

  const rows: SawRow[] = PLATFORMS.map((platform) => {
    const normalized = {} as Record<CriterionKey, number>;
    const weighted = {} as Record<CriterionKey, number>;
    let score = 0;
    for (const c of CRITERIA) {
      const column = PLATFORMS.map((p) => p.values[c.key]);
      const n =
        c.type === "benefit"
          ? platform.values[c.key] / Math.max(...column)
          : Math.min(...column) / platform.values[c.key];
      normalized[c.key] = n;
      weighted[c.key] = n * weights[c.key];
      score += weighted[c.key];
    }
    return { platform, normalized, weighted, score, score100: 0 };
  });

  const maxScore = Math.max(...rows.map((r) => r.score)) || 1;
  for (const r of rows) r.score100 = Math.round((r.score / maxScore) * 1000) / 10;
  rows.sort((a, b) => b.score - a.score);

  const topCriteria = [...CRITERIA]
    .sort((a, b) => weights[b.key] - weights[a.key])
    .slice(0, 2);

  return { weights, rows, best: rows[0]!, topCriteria };
}

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
