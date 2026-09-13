import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Users } from "lucide-react";
import { Logo } from "@/components/brand";
import { CRITERIA, PLATFORMS } from "@/lib/saw";
import { fetchSheetDbResponses, loadResponses, toCsv, type ResponseRecord } from "@/lib/storage";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Responden — Music Match" },
      {
        name: "description",
        content: "Statistik responden, distribusi rekomendasi, rata-rata bobot kriteria SAW, dan ekspor data ke CSV.",
      },
      { property: "og:title", content: "Dashboard Responden — Music Match" },
      { property: "og:description", content: "Ringkasan jawaban kuesioner dan ekspor CSV untuk penelitian." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [rows, setRows] = useState<ResponseRecord[]>([]);
  const [dataSource, setDataSource] = useState("Memuat data...");

  useEffect(() => {
    const localRows = loadResponses().filter((row) => !row.id.startsWith("seed-"));
    fetchSheetDbResponses()
      .then((sheetRows) => {
        setRows(sheetRows);
        setDataSource(`${sheetRows.length} responden dari SheetDB`);
      })
      .catch(() => {
        setRows(localRows);
        setDataSource(`${localRows.length} data lokal (SheetDB tidak tersedia)`);
      });
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const mahasiswa = rows.filter((r) => r.mahasiswa === "Iya").length;
    const harian = rows.filter((r) => r.frekuensi === "Setiap hari").length;
    const byPlatform = new Map<string, number>(PLATFORMS.map((platform) => [platform.name, 0]));
    for (const r of rows) {
      const normalizePlatform = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
      const selectedText = normalizePlatform(r.platformSekarang);
      const selected = PLATFORMS.find((platform) =>
        selectedText.includes(normalizePlatform(platform.name)) ||
        (platform.name === "YouTube Music" && selectedText.includes("youtube")),
      )?.name;
      if (selected) byPlatform.set(selected, (byPlatform.get(selected) || 0) + 1);
    }
    const distribusi = [...byPlatform.entries()].sort((a, b) => b[1] - a[1]);
    const avg = CRITERIA.map((c) => ({
      label: c.label,
      value: total ? rows.reduce((s, r) => s + r.ratings[c.key], 0) / total : 0,
    }));
    return { total, mahasiswa, harian, distribusi, avg, top: distribusi[0]?.[0] ?? "-" };
  }, [rows]);

  const exportCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `music-match-responden-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-7 sm:px-8">
        <Logo />
        <Link to="/kuesioner" className="shrink-0 text-sm text-muted-foreground transition hover:text-foreground">
          Isi kuesioner
        </Link>
      </header>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="eyebrow text-neon">Dashboard responden</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <h1 className="text-3xl sm:text-4xl">Ringkasan data penelitian.</h1>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-neon px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            <Download className="h-4 w-4" /> Ekspor CSV
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Sumber grafik: {dataSource}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total responden" value={String(stats.total)} icon />
          <Stat label="Berstatus mahasiswa" value={`${stats.mahasiswa}`} />
          <Stat label="Mendengarkan tiap hari" value={`${stats.harian}`} />
          <Stat label="Pilihan pengguna terbanyak" value={stats.top} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="Distribusi pilihan platform pengguna">
            <div className="flex h-56 items-end justify-around gap-3 border-b border-border px-2 pb-0">
              {stats.distribusi.map(([name, count]) => (
                <div key={name} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-sm font-bold text-neon">{count}</span>
                  <div
                    className="w-full max-w-14 rounded-t-xl bg-neon transition-all"
                    style={{ height: `${stats.total ? Math.max((count / stats.total) * 100, 6) : 0}%` }}
                    title={`${name}: ${count} responden`}
                  />
                  <span className="w-full truncate text-center text-xs text-muted-foreground" title={name}>
                    {name}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Grafik mengikuti platform yang dipilih oleh {stats.total} responden dari web dan SheetDB.</p>
          </Panel>

          <Panel title="Rata-rata bobot kriteria (1-5)">
            <div className="space-y-4">
              {stats.avg.map((a) => (
                <div key={a.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">{a.label}</span>
                    <span className="shrink-0 text-muted-foreground">{a.value.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-magenta" style={{ width: `${(a.value / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Tabel responden" className="mt-6">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="bg-surface-2/60 text-muted-foreground">
                <tr>
                  {["Nama", "Status", "Semester", "Frekuensi", "Platform saat ini", "Anggaran", "Hasil SAW", "Skor"].map((h) => (
                    <th key={h} className="px-3 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-3 font-semibold whitespace-nowrap">{r.nama}</td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{r.mahasiswa}</td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{r.semester}</td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{r.frekuensi}</td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{r.platformSekarang}</td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{r.budget}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-neon">{r.hasil}</td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{r.skor.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </main>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/50 p-5">
      <div className="flex items-center gap-2">
        {icon && <Users className="h-3.5 w-3.5 text-neon" />}
        <p className="eyebrow text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 truncate text-2xl font-bold">{value}</p>
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-surface/40 p-5 sm:p-6 ${className}`}>
      <h2 className="mb-5 text-base font-bold">{title}</h2>
      {children}
    </section>
  );
}
