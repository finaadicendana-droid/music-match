import { CRITERIA, computeSaw, type CriterionKey, type Ratings } from "./saw";

export const SHEETDB_URL = "https://sheetdb.io/api/v1/o0gvnnvpeln2n";

export interface ResponseRecord {
  id: string;
  createdAt: string;
  nama: string;
  mahasiswa: "Iya" | "Tidak";
  semester: string;
  frekuensi: string;
  platformSekarang: string;
  ratings: Ratings;
  budget: string;
  aktivitas: string;
  fiturPrioritas: string[];
  modelLangganan: string;
  perangkat: string;
  saran: string;
  setuju: boolean;
  hasil: string;
  skor: number;
}

const KEY = "music-match-responses";

const r = (h: number, a: number, k: number, m: number, f: number): Record<CriterionKey, number> => ({
  harga: h,
  audio: a,
  katalog: k,
  kemudahan: m,
  fitur: f,
});

export const SEED_RESPONSES: ResponseRecord[] = [
  {
    id: "seed-1", createdAt: "2026-08-14T09:12:00.000Z", nama: "Rangga Pratama", mahasiswa: "Iya",
    semester: "Semester 5", frekuensi: "Setiap hari", platformSekarang: "Spotify", ratings: r(5, 3, 5, 4, 3),
    budget: "Rp25.000 - Rp50.000", aktivitas: "Belajar / mengerjakan tugas", fiturPrioritas: ["Mode offline", "Lirik"],
    modelLangganan: "Berbayar dengan harga mahasiswa", perangkat: "Smartphone", saran: "", setuju: true,
    hasil: "Spotify", skor: 100,
  },
  {
    id: "seed-2", createdAt: "2026-08-15T14:40:00.000Z", nama: "Nadia Safira", mahasiswa: "Iya",
    semester: "Semester 3", frekuensi: "Setiap hari", platformSekarang: "Apple Music", ratings: r(2, 5, 4, 4, 3),
    budget: "Rp50.000 - Rp100.000", aktivitas: "Olahraga", fiturPrioritas: ["Kualitas lossless", "Rekomendasi AI"],
    modelLangganan: "Berbayar penuh", perangkat: "Smartphone", saran: "", setuju: true,
    hasil: "Apple Music", skor: 100,
  },
  {
    id: "seed-3", createdAt: "2026-08-16T08:05:00.000Z", nama: "Dimas Wijaya", mahasiswa: "Iya",
    semester: "Semester 7", frekuensi: "Beberapa kali seminggu", platformSekarang: "YouTube Music", ratings: r(3, 3, 5, 4, 5),
    budget: "Rp25.000 - Rp50.000", aktivitas: "Perjalanan / commuting", fiturPrioritas: ["Podcast", "Video musik"],
    modelLangganan: "Gratis dengan iklan", perangkat: "Smartphone", saran: "", setuju: true,
    hasil: "YouTube Music", skor: 98.2,
  },
  {
    id: "seed-4", createdAt: "2026-08-18T19:22:00.000Z", nama: "Ayu Larasati", mahasiswa: "Iya",
    semester: "Semester 1", frekuensi: "Setiap hari", platformSekarang: "Joox", ratings: r(5, 2, 3, 5, 2),
    budget: "< Rp25.000", aktivitas: "Santai / hiburan", fiturPrioritas: ["Karaoke", "Mode offline"],
    modelLangganan: "Gratis dengan iklan", perangkat: "Smartphone", saran: "", setuju: true,
    hasil: "Joox", skor: 100,
  },
  {
    id: "seed-5", createdAt: "2026-08-20T11:31:00.000Z", nama: "Bagas Setiawan", mahasiswa: "Tidak",
    semester: "-", frekuensi: "Beberapa kali seminggu", platformSekarang: "SoundCloud", ratings: r(4, 3, 4, 3, 5),
    budget: "< Rp25.000", aktivitas: "Bekerja / produktivitas", fiturPrioritas: ["Musik indie", "Rekomendasi AI"],
    modelLangganan: "Gratis dengan iklan", perangkat: "Laptop / Desktop", saran: "", setuju: true,
    hasil: "SoundCloud", skor: 96.4,
  },
  {
    id: "seed-6", createdAt: "2026-08-22T16:47:00.000Z", nama: "Salsabila Nur", mahasiswa: "Iya",
    semester: "Semester 4", frekuensi: "Setiap hari", platformSekarang: "Spotify", ratings: r(4, 4, 5, 5, 4),
    budget: "Rp25.000 - Rp50.000", aktivitas: "Belajar / mengerjakan tugas", fiturPrioritas: ["Lirik", "Rekomendasi AI"],
    modelLangganan: "Berbayar dengan harga mahasiswa", perangkat: "Smartphone", saran: "", setuju: true,
    hasil: "Spotify", skor: 100,
  },
  {
    id: "seed-7", createdAt: "2026-08-25T10:03:00.000Z", nama: "Fajar Ramadhan", mahasiswa: "Iya",
    semester: "Semester 6", frekuensi: "Sesekali", platformSekarang: "YouTube Music", ratings: r(5, 3, 4, 4, 3),
    budget: "< Rp25.000", aktivitas: "Perjalanan / commuting", fiturPrioritas: ["Mode offline"],
    modelLangganan: "Gratis dengan iklan", perangkat: "Smartphone", saran: "", setuju: true,
    hasil: "Joox", skor: 100,
  },
  {
    id: "seed-8", createdAt: "2026-08-28T20:15:00.000Z", nama: "Intan Permata", mahasiswa: "Iya",
    semester: "Semester 8", frekuensi: "Setiap hari", platformSekarang: "Apple Music", ratings: r(3, 5, 5, 4, 4),
    budget: "Rp50.000 - Rp100.000", aktivitas: "Santai / hiburan", fiturPrioritas: ["Kualitas lossless", "Lirik"],
    modelLangganan: "Berbayar penuh", perangkat: "Smartphone", saran: "", setuju: true,
    hasil: "Spotify", skor: 100,
  },
];

export function loadResponses(): ResponseRecord[] {
  if (typeof window === "undefined") return SEED_RESPONSES;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SEED_RESPONSES));
      return SEED_RESPONSES;
    }
    const parsed = JSON.parse(raw) as ResponseRecord[];
    return Array.isArray(parsed) ? parsed : SEED_RESPONSES;
  } catch {
    return SEED_RESPONSES;
  }
}

export function saveResponse(record: ResponseRecord) {
  if (typeof window === "undefined") return;
  const all = loadResponses();
  window.localStorage.setItem(KEY, JSON.stringify([...all, record]));
  window.localStorage.setItem("music-match-last", JSON.stringify(record));
}

export function loadLastResponse(): ResponseRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("music-match-last");
    return raw ? (JSON.parse(raw) as ResponseRecord) : null;
  } catch {
    return null;
  }
}

export async function fetchSheetDbRatings(): Promise<{ ratings: Ratings; count: number }> {
  const response = await fetch(SHEETDB_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`SheetDB returned ${response.status}`);

  const rows = (await response.json()) as Record<string, unknown>[];
  const totals = { harga: 0, audio: 0, katalog: 0, kemudahan: 0, fitur: 0 } satisfies Ratings;
  let count = 0;

  const fields: Record<CriterionKey, string> = {
    harga: "Seberapa penting harga berlangganan dalam memilih platform streaming musik?",
    audio: "Seberapa penting kualitas audio dalam memilih platform streaming musik?",
    katalog: "Seberapa penting kelengkapan koleksi musik dalam memilih platform streaming musik?",
    kemudahan: "Seberapa penting kemudahan penggunaan aplikasi dalam memilih platform streaming musik?",
    fitur: "Seberapa penting fitur yang tersedia dalam memilih platform streaming musik?",
  };

  const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

  for (const row of rows) {
    const values = CRITERIA.map((criterion) => {
      const expected = normalize(fields[criterion.key]);
      const entry = Object.entries(row).find(([key]) => normalize(key).startsWith(expected));
      return Number(entry?.[1]);
    });
    if (values.every((value) => Number.isFinite(value) && value >= 1 && value <= 5)) {
      CRITERIA.forEach((criterion, index) => {
        totals[criterion.key] += values[index]!;
      });
      count += 1;
    }
  }

  if (!count) throw new Error("SheetDB tidak memiliki rating yang valid");
  return {
    count,
    ratings: CRITERIA.reduce((average, criterion) => {
      average[criterion.key] = totals[criterion.key] / count;
      return average;
    }, {} as Ratings),
  };
}

export async function fetchSheetDbResponses(): Promise<ResponseRecord[]> {
  const response = await fetch(SHEETDB_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`SheetDB returned ${response.status}`);

  const rows = (await response.json()) as Record<string, unknown>[];
  const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
  const fields: Record<CriterionKey, string> = {
    harga: "Seberapa penting harga berlangganan dalam memilih platform streaming musik?",
    audio: "Seberapa penting kualitas audio dalam memilih platform streaming musik?",
    katalog: "Seberapa penting kelengkapan koleksi musik dalam memilih platform streaming musik?",
    kemudahan: "Seberapa penting kemudahan penggunaan aplikasi dalam memilih platform streaming musik?",
    fitur: "Seberapa penting fitur yang tersedia dalam memilih platform streaming musik?",
  };
  const value = (row: Record<string, unknown>, label: string) => {
    const entry = Object.entries(row).find(([key]) => normalize(key).startsWith(normalize(label)));
    return entry?.[1];
  };

  return rows.flatMap((row, index) => {
    const ratings = {} as Ratings;
    for (const criterion of CRITERIA) {
      const parsed = Number(value(row, fields[criterion.key]));
      if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) return [];
      ratings[criterion.key] = parsed;
    }
    const result = computeSaw(ratings);
    return [{
      id: `sheetdb-${index}`,
      createdAt: String(row["Timestamp"] ?? ""),
      nama: String(row["Nama "] ?? row["Nama"] ?? "Tanpa nama"),
      mahasiswa: String(row["Apakah Anda merupakan mahasiswa?"] ?? "") === "Tidak" ? "Tidak" : "Iya",
      semester: String(row["Semester saat ini :"] ?? "-"),
      frekuensi: String(value(row, "Seberapa sering Anda menggunakan platform streaming musik?") ?? "-"),
      platformSekarang: String(value(row, "Platform streaming musik yang paling sering Anda gunakan saat ini") ?? "-"),
      ratings,
      budget: String(value(row, "Berapa kisaran biaya berlangganan") ?? "-"),
      aktivitas: String(value(row, "Untuk aktivitas apa Anda paling sering menggunakan platform streaming musik?") ?? "-"),
      fiturPrioritas: [],
      modelLangganan: "",
      perangkat: "",
      saran: "",
      setuju: true,
      hasil: result.best.platform.name,
      skor: result.best.score100,
    } satisfies ResponseRecord];
  });
}

export function toCsv(rows: ResponseRecord[]): string {
  const head = [
    "id", "waktu", "nama", "mahasiswa", "semester", "frekuensi", "platform_saat_ini",
    "w_harga", "w_audio", "w_katalog", "w_kemudahan", "w_fitur",
    "budget", "aktivitas", "fitur_prioritas", "model_langganan", "perangkat", "hasil", "skor",
  ];
  const esc = (v: string | number | boolean) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = rows.map((x) =>
    [
      x.id, x.createdAt, x.nama, x.mahasiswa, x.semester, x.frekuensi, x.platformSekarang,
      x.ratings.harga, x.ratings.audio, x.ratings.katalog, x.ratings.kemudahan, x.ratings.fitur,
      x.budget, x.aktivitas, x.fiturPrioritas.join(" | "), x.modelLangganan, x.perangkat, x.hasil, x.skor,
    ].map(esc).join(","),
  );
  return [head.join(","), ...lines].join("\n");
}
