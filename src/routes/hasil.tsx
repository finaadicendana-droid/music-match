import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, Download, RotateCcw, Trophy } from "lucide-react";
import { jsPDF } from "jspdf";
import { Logo } from "@/components/brand";
import { CRITERIA, computeSaw, rupiah, type Ratings, type SawResult } from "@/lib/saw";
import { loadLastResponse, type ResponseRecord } from "@/lib/storage";

export const Route = createFileRoute("/hasil")({
  head: () => ({
    meta: [
      { title: "Hasil Rekomendasi Platform Musik — Music Match" },
      {
        name: "description",
        content: "Rekomendasi utama, alternatif berperingkat, dan transparansi perhitungan SAW dari jawaban kuesionermu.",
      },
      { property: "og:title", content: "Hasil Rekomendasi Platform Musik — Music Match" },
      { property: "og:description", content: "Lihat platform musik yang paling cocok dengan sound profile-mu." },
    ],
  }),
  component: Hasil,
});

function Hasil() {
  const navigate = useNavigate();
  const [record, setRecord] = useState<ResponseRecord | null>(null);
  const [result, setResult] = useState<SawResult | null>(null);
  const [ratings, setRatings] = useState<Ratings | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const last = loadLastResponse();
    if (!last) {
      navigate({ to: "/kuesioner" });
      return;
    }
    setRecord(last);
    setRatings(last.ratings);
    setResult(computeSaw(last.ratings));
  }, [navigate]);

  if (!record || !result || !ratings) {
    return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Memuat hasil...</main>;
  }

  const best = result.best;
  const alternatives = result.rows.slice(1);

  const downloadResult = () => {
    const pdf = new jsPDF();
    const fileName = record.nama.trim().replace(/\s+/g, "-").toLowerCase() || "responden";
    pdf.setTextColor(20, 30, 40);
    pdf.setFontSize(20);
    pdf.text("MUSIC MATCH", 20, 22);
    pdf.setFontSize(11);
    pdf.setTextColor(90, 100, 110);
    pdf.text("Hasil rekomendasi platform musik", 20, 30);
    pdf.text(`Nama: ${record.nama}`, 20, 45);
    pdf.setTextColor(20, 30, 40);
    pdf.setFontSize(16);
    pdf.text(`Rekomendasi utama: ${best.platform.name}`, 20, 62);
    pdf.setFontSize(13);
    pdf.text(`Skor: ${best.score100.toFixed(1)}/100`, 20, 71);
    pdf.setFontSize(10);
    const blurbLines = pdf.splitTextToSize(best.platform.blurb, 170);
    pdf.text(blurbLines, 20, 82);
    pdf.setFontSize(13);
    pdf.text("Peringkat platform", 20, 108);
    pdf.setFontSize(11);
    result.rows.forEach((row, index) => {
      const y = 120 + index * 11;
      pdf.text(`${index + 1}. ${row.platform.name}`, 25, y);
      pdf.text(`${row.score100.toFixed(1)}/100`, 155, y);
      pdf.setDrawColor(220, 225, 230);
      pdf.line(25, y + 3, 185, y + 3);
    });
    pdf.setFontSize(9);
    pdf.setTextColor(110, 120, 130);
    pdf.text("Dihitung dengan metode Simple Additive Weighting (SAW).", 20, 190);
    pdf.save(`music-match-hasil-${fileName}.pdf`);
  };

  return (
    <main className="aurora min-h-screen bg-background pb-24">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-7 sm:px-8">
        <Logo />
        <Link
          to="/kuesioner"
          className="inline-flex shrink-0 items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" /> Mulai ulang
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <p className="eyebrow text-neon">Hasil analisis untuk {record.nama}</p>
        <h1 className="mt-4 text-4xl leading-[1.05] sm:text-5xl">
          Ini yang paling cocok dengan sound profile-mu.
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Rekomendasi ini dihitung dari jawabanmu sendiri menggunakan metode SAW.
        </p>

        <section className="relative mt-10 overflow-hidden rounded-3xl border border-success/60 bg-surface/40 p-6 sm:p-9">
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 text-success">
                <Trophy className="h-4 w-4" />
                <span className="eyebrow">Rekomendasi utama</span>
              </span>
              <h2 className="mt-4 text-4xl sm:text-5xl">{best.platform.name}</h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Paling kuat pada {result.topCriteria.map((c) => c.label.toLowerCase()).join(" dan ")}, sesuai
                prioritas Anda. {best.platform.blurb}
              </p>
              <p className="mt-3 text-xs text-muted-foreground/70">
                Harga acuan {rupiah(best.platform.values.harga)}/bulan · Anggaranmu {record.budget}
              </p>
            </div>
            <div className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl bg-surface-2/80 text-3xl font-bold sm:h-32 sm:w-32 sm:text-4xl">
              {best.score100.toFixed(1)}
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-border bg-surface/40 p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-neon">Grafik skor rekomendasi</p>
              <h2 className="mt-2 text-xl">Perbandingan semua platform</h2>
            </div>
            <span className="eyebrow shrink-0 text-muted-foreground">Skor / 100</span>
          </div>
          <div className="mt-7 space-y-5">
            {result.rows.map((row) => (
              <div key={row.platform.id}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className={`font-semibold ${row.platform.id === best.platform.id ? "text-neon" : ""}`}>
                    {row.platform.name}
                  </span>
                  <span className="shrink-0 font-bold">{row.score100.toFixed(1)}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={`h-full rounded-full transition-all ${row.platform.id === best.platform.id ? "bg-neon" : "bg-magenta"}`}
                    style={{ width: `${row.score100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 flex items-end justify-between gap-4">
          <h2 className="text-xl">Alternatif untuk dipertimbangkan</h2>
          <span className="eyebrow shrink-0 text-muted-foreground">{alternatives.length} platform</span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {alternatives.map((row, i) => (
            <article key={row.platform.id} className="rounded-2xl border border-border bg-surface/50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="eyebrow text-muted-foreground/70">Peringkat {i + 2}</p>
                  <h3 className="mt-1.5 truncate text-lg">{row.platform.name}</h3>
                </div>
                <span className="shrink-0 rounded-xl bg-surface-2/80 px-3 py-1.5 text-sm font-bold">
                  {row.score100.toFixed(1)}
                </span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-neon" style={{ width: `${row.score100}%` }} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{row.platform.blurb}</p>
              <p className="mt-2 text-xs text-muted-foreground/70">
                Selisih {(best.score100 - row.score100).toFixed(1)} poin dari {best.platform.name} ·{" "}
                {rupiah(row.platform.values.harga)}/bulan
              </p>
            </article>
          ))}
        </div>

        <section className="mt-12 overflow-hidden rounded-2xl border border-border bg-surface/40">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
          >
            <span className="min-w-0">
              <span className="block text-base font-bold">Transparansi Perhitungan SAW</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Matriks keputusan, normalisasi, dan penjumlahan terbobot.
              </span>
            </span>
            <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="space-y-8 border-t border-border px-5 py-7 sm:px-6">
              <div>
                <h3 className="text-sm font-bold">1. Bobot kriteria (W)</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Bobot = nilai kepentinganmu dibagi total kepentingan, sehingga jumlahnya 1.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CRITERIA.map((c) => (
                    <span key={c.key} className="rounded-full border border-border bg-surface-2/60 px-3 py-1.5 text-xs">
                      {c.label} · {ratings[c.key].toFixed(2)}/5 → {result.weights[c.key].toFixed(3)}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold">2. Matriks keputusan (X)</h3>
                <Table
                  head={["Alternatif", ...CRITERIA.map((c) => c.label)]}
                  rows={result.rows.map((r) => [
                    r.platform.name,
                    ...CRITERIA.map((c) => (c.key === "harga" ? rupiah(r.platform.values.harga) : String(r.platform.values[c.key]))),
                  ])}
                />
              </div>

              <div>
                <h3 className="text-sm font-bold">3. Normalisasi (R)</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Benefit: r<sub>ij</sub> = x<sub>ij</sub> / max(x<sub>j</sub>) · Cost: r<sub>ij</sub> = min(x
                  <sub>j</sub>) / x<sub>ij</sub>. Harga memakai rumus cost, empat kriteria lain memakai benefit.
                </p>
                <Table
                  head={["Alternatif", ...CRITERIA.map((c) => c.label)]}
                  rows={result.rows.map((r) => [r.platform.name, ...CRITERIA.map((c) => r.normalized[c.key].toFixed(3))])}
                />
              </div>

              <div>
                <h3 className="text-sm font-bold">4. Nilai preferensi (V = Σ w × r)</h3>
                <Table
                  head={["Alternatif", ...CRITERIA.map((c) => c.label), "V", "Skor /100"]}
                  rows={result.rows.map((r) => [
                    r.platform.name,
                    ...CRITERIA.map((c) => r.weighted[c.key].toFixed(3)),
                    r.score.toFixed(4),
                    r.score100.toFixed(1),
                  ])}
                />
              </div>
            </div>
          )}
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/kuesioner"
            className="inline-flex items-center gap-2 rounded-full bg-neon px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            <RotateCcw className="h-4 w-4" /> Isi ulang kuesioner
          </Link>
          <button
            type="button"
            onClick={downloadResult}
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm transition hover:bg-surface"
          >
            <Download className="h-4 w-4" /> Unduh hasil
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm transition hover:bg-surface"
          >
            Dashboard responden
          </Link>
        </div>
      </div>
    </main>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead className="bg-surface-2/60 text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2.5 font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              {r.map((cell, j) => (
                <td key={j} className={`px-3 py-2.5 whitespace-nowrap ${j === 0 ? "font-semibold" : "text-muted-foreground"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
