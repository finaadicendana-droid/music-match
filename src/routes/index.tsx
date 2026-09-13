import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Sparkles } from "lucide-react";
import { Logo, Soundwave } from "@/components/brand";
import hero from "@/assets/hero-headphones.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Music Match — Rekomendasi Platform Musik dengan Metode SAW" },
      {
        name: "description",
        content:
          "Isi kuesioner singkat dan temukan platform streaming musik yang paling cocok untukmu, dihitung dengan metode Simple Additive Weighting.",
      },
      { property: "og:title", content: "Music Match — Temukan platform musik yang paling cocok" },
      {
        property: "og:description",
        content: "Kuesioner 5 kriteria dengan perhitungan SAW transparan untuk mahasiswa.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="aurora min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-7 sm:px-8">
        <Logo />
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-6 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-2">
            <Sparkles className="h-3.5 w-3.5 text-magenta" />
            <span className="eyebrow text-muted-foreground">Kuesioner SAW · 5 Kriteria</span>
          </span>

          <h1 className="mt-7 text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            Temukan <span className="text-neon">platform musik</span> yang paling cocok.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
            Jawab beberapa pertanyaan tentang kebiasaan dan prioritas musikmu. Kami akan menghitung
            rekomendasi utama dan alternatif menggunakan metode Simple Additive Weighting.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              to="/kuesioner"
              className="inline-flex items-center gap-2 rounded-full bg-neon px-7 py-4 font-semibold text-primary-foreground transition hover:brightness-110 glow-cyan"
            >
              Mulai Kuesioner <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <BarChart3 className="h-4 w-4" /> Lihat dashboard responden
            </Link>
          </div>

          <p className="mt-8 text-xs text-muted-foreground/70">
            Hanya 2 menit · Tidak ada jawaban benar atau salah
          </p>
        </div>

        <div className="rounded-[2rem] border border-border bg-surface/40 p-3">
          <div className="relative overflow-hidden rounded-[1.6rem] border border-border bg-background">
            <img
              src={hero}
              alt="Mahasiswa mendengarkan musik dengan headphone"
              width={900}
              height={1200}
              className="h-[420px] w-full object-cover object-center opacity-90 sm:h-[520px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <Soundwave className="mb-5 h-16" />
              <h2 className="text-2xl">Your sound. Your match.</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Preferensi kecil, rekomendasi yang lebih personal.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
