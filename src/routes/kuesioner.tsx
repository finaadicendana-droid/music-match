import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/brand";
import { CRITERIA, computeSaw, type CriterionKey, type Ratings } from "@/lib/saw";
import { saveResponse, type ResponseRecord } from "@/lib/storage";

export const Route = createFileRoute("/kuesioner")({
  head: () => ({
    meta: [
      { title: "Kuesioner Preferensi Musik — Music Match" },
      {
        name: "description",
        content: "Enam bagian singkat tentang identitas, prioritas kriteria SAW, dan kebutuhan mendengarkan musikmu.",
      },
      { property: "og:title", content: "Kuesioner Preferensi Musik — Music Match" },
      { property: "og:description", content: "Isi 6 bagian singkat untuk mendapatkan rekomendasi platform musik." },
    ],
  }),
  component: Kuesioner,
});

const SEMESTER = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8", "> Semester 8"];
const FREKUENSI = ["Setiap hari", "Beberapa kali seminggu", "Sesekali", "Jarang"];
const PLATFORM_SAAT_INI = ["Spotify", "YouTube Music", "Apple Music", "Joox", "SoundCloud", "Belum menggunakan"];
const BUDGET = ["< Rp25.000", "Rp25.000 - Rp50.000", "Rp50.000 - Rp100.000", "> Rp100.000"];
const AKTIVITAS = ["Belajar / mengerjakan tugas", "Perjalanan / commuting", "Olahraga", "Santai / hiburan", "Bekerja / produktivitas"];
const FITUR = ["Lirik", "Mode offline", "Rekomendasi AI", "Podcast", "Video musik", "Karaoke", "Kualitas lossless", "Musik indie", "Fitur sosial"];
const MODEL = ["Gratis dengan iklan", "Berbayar dengan harga mahasiswa", "Berbayar penuh", "Belum yakin"];
const PERANGKAT = ["Smartphone", "Laptop / Desktop", "Tablet", "Smart speaker / TV"];

interface FormState {
  nama: string;
  mahasiswa: "Iya" | "Tidak" | "";
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
}

const initial: FormState = {
  nama: "",
  mahasiswa: "",
  semester: "",
  frekuensi: "",
  platformSekarang: "",
  ratings: { harga: 3, audio: 3, katalog: 3, kemudahan: 3, fitur: 3 },
  budget: "",
  aktivitas: "",
  fiturPrioritas: [],
  modelLangganan: "",
  perangkat: "",
  saran: "",
  setuju: false,
};

const SECTIONS = [
  { eyebrow: "Bagian 1 / Identitas Responden", title: "Ceritakan sedikit tentangmu.", sub: "Jawaban ini membantu kami memahami konteks preferensi platform musikmu.", next: "Lanjut ke preferensi" },
  { eyebrow: "Bagian 2 / Preferensi Kriteria SAW", title: "Seberapa penting tiap kriteria?", sub: "Beri bobot 1 (tidak penting) sampai 5 (sangat penting). Bobot inilah yang dipakai perhitungan SAW.", next: "Lanjut ke kebutuhan" },
  { eyebrow: "Bagian 3 / Kebutuhan", title: "Berapa yang masuk akal untukmu?", sub: "Kebiasaan dan anggaran membantu kami menjelaskan hasil rekomendasi.", next: "Lanjut ke fitur" },
  { eyebrow: "Bagian 4 / Preferensi Fitur", title: "Fitur apa yang kamu prioritaskan?", sub: "Pilih fitur yang paling sering kamu pakai dan model langganan yang kamu inginkan.", next: "Lanjut ke preferensi umum" },
  { eyebrow: "Bagian 5 / Preferensi Umum", title: "Sedikit lagi soal kebiasaanmu.", sub: "Perangkat utama dan masukan bebas untuk penelitian ini.", next: "Lanjut ke persetujuan" },
  { eyebrow: "Bagian 6 / Persetujuan Responden", title: "Boleh kami gunakan jawabanmu?", sub: "Data digunakan hanya untuk keperluan penelitian dan disimpan tanpa identitas sensitif.", next: "Lihat rekomendasi" },
];

function Kuesioner() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [calculating, setCalculating] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const valid = useMemo(() => {
    if (step === 0) return form.nama.trim().length > 1 && form.mahasiswa !== "" && form.frekuensi !== "" && form.platformSekarang !== "";
    if (step === 2) return form.budget !== "" && form.aktivitas !== "";
    if (step === 3) return form.fiturPrioritas.length > 0 && form.modelLangganan !== "";
    if (step === 4) return form.perangkat !== "";
    if (step === 5) return form.setuju;
    return true;
  }, [step, form]);

const submit = () => {
    setCalculating(true);
    const result = computeSaw(form.ratings);
    const record: ResponseRecord = {
      id: `res-${Date.now()}`,
      createdAt: new Date().toLocaleString("id-ID"),
      nama: form.nama.trim(),
      mahasiswa: form.mahasiswa === "Tidak" ? "Tidak" : "Iya",
      semester: form.mahasiswa === "Iya" ? form.semester || "-" : "-",
      frekuensi: form.frekuensi,
      platformSekarang: form.platformSekarang,
      ratings: form.ratings,
      budget: form.budget,
      aktivitas: form.aktivitas,
      fiturPrioritas: form.fiturPrioritas,
      modelLangganan: form.modelLangganan,
      perangkat: form.perangkat,
      saran: form.saran,
      setuju: form.setuju,
      hasil: result.best.platform.name,
      skor: result.best.score100,
    };

    // 1. Simpan ke Local Storage
    saveResponse(record);

    // 2. Format payload untuk SheetDB
    const payload = {
      data: {
        "Timestamp": record.createdAt,
        "Nama ": record.nama,
        "Apakah Anda merupakan mahasiswa?": record.mahasiswa,
        "Semester saat ini :": record.semester,
        "Seberapa sering Anda menggunakan platform streaming musik? ": record.frekuensi,
        "Platform streaming musik yang paling sering Anda gunakan saat ini ": record.platformSekarang,
        "Masukan tambahan terkait logistik": "-",
        "  Seberapa penting harga berlangganan dalam memilih platform streaming musik?  ": record.ratings.harga,
        "Seberapa penting kualitas audio dalam memilih platform streaming musik?  ": record.ratings.audio,
        "Seberapa penting kelengkapan koleksi musik dalam memilih platform streaming musik?  ": record.ratings.katalog,
        "Seberapa penting kemudahan penggunaan aplikasi dalam memilih platform streaming musik?  Ada komentar lain terkait sesi atau agenda acara secara keseluruhan?": record.ratings.kemudahan,
        "Seberapa penting fitur yang tersedia dalam memilih platform streaming musik?  ": record.ratings.fitur,
        "Berapa kisaran biaya berlangganan yang menurut Anda masih terjangkau sebagai mahasiswa?  ": record.budget,
        "Untuk aktivitas apa Anda paling sering menggunakan platform streaming musik?  ": record.aktivitas,
        "Seberapa penting fitur rekomendasi musik berdasarkan selera Anda?  ": record.ratings.fitur,
        "Seberapa penting penggunaan kuota internet yang efisien bagi Anda?  ": 3,
        "Fitur apa yang paling Anda butuhkan dari platform streaming musik?  ": record.fiturPrioritas.join(", "),
        "Apakah Anda lebih memilih platform streaming musik gratis atau berbayar?  ": record.modelLangganan,
        "Jika menggunakan layanan berbayar, apa pertimbangan utama Anda?  ": record.budget,
        "Menurut Anda, apa faktor yang paling menentukan dalam memilih platform streaming musik?  ": record.hasil,
        "Jika suatu platform memiliki harga lebih murah tetapi kualitas audio lebih rendah, mana yang lebih Anda pilih?  ": "Harga murah",
        "Jika suatu platform memiliki koleksi musik lebih lengkap tetapi aplikasinya lebih sulit digunakan, mana yang lebih Anda pilih?  ": "Koleksi lengkap",
        "Apa yang Anda harapkan dari platform streaming musik yang ideal bagi mahasiswa?  ": record.saran || "-",
        "Apakah Anda bersedia bahwa jawaban dari kuesioner ini digunakan sebagai data penelitian?  ": record.setuju ? "Bersedia" : "Tidak bersedia",
      },
    };

    // 3. Simpan ke SheetDB sebelum membuka halaman hasil
    fetch("https://sheetdb.io/api/v1/o0gvnnvpeln2n", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => console.log("Berhasil tersimpan di SheetDB:", data))
      .catch((err) => console.error("Gagal mengirim ke SheetDB:", err))
      .finally(() => {
        window.setTimeout(() => {
          navigate({ to: "/hasil" });
        }, 2800);
      });
  }; 

  const inputClass = "mt-2 w-full rounded-xl border border-border bg-surface-2/60 px-4 py-3 text-sm outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/20";
  const optionClass = "flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-4 py-3 text-sm transition hover:border-neon/60 has-[:checked]:border-neon has-[:checked]:bg-neon/10";
  const section = SECTIONS[step]!;

  return (
    <main className="aurora min-h-screen bg-background pb-24">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-7 sm:px-8">
        <Logo />
        <span className="eyebrow text-muted-foreground">{step + 1} / {SECTIONS.length}</span>
      </header>
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-neon transition-all duration-500" style={{ width: `${((step + 1) / SECTIONS.length) * 100}%` }} /></div>
        <section className="mt-12"><p className="eyebrow text-neon">{section.eyebrow}</p><h1 className="mt-4 text-4xl leading-tight sm:text-5xl">{section.title}</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{section.sub}</p></section>

        <section className="mt-10 rounded-3xl border border-border bg-surface/40 p-5 sm:p-8">
          {step === 0 && <div className="space-y-6">
            <label className="block text-sm font-semibold">Nama<input className={inputClass} value={form.nama} onChange={(event) => set("nama", event.target.value)} placeholder="Nama panggilanmu" /></label>
            <div><p className="text-sm font-semibold">Apakah kamu mahasiswa?</p><div className="mt-2 grid gap-3 sm:grid-cols-2">{["Iya", "Tidak"].map((value) => <label className={optionClass} key={value}><input type="radio" name="mahasiswa" value={value} checked={form.mahasiswa === value} onChange={(event) => set("mahasiswa", event.target.value as FormState["mahasiswa"])} />{value}</label>)}</div></div>
            {form.mahasiswa === "Iya" && <label className="block text-sm font-semibold">Semester saat ini<select className={inputClass} value={form.semester} onChange={(event) => set("semester", event.target.value)}><option value="">Pilih semester</option>{SEMESTER.map((value) => <option key={value}>{value}</option>)}</select></label>}
            <label className="block text-sm font-semibold">Seberapa sering menggunakan platform streaming musik?<select className={inputClass} value={form.frekuensi} onChange={(event) => set("frekuensi", event.target.value)}><option value="">Pilih frekuensi</option>{FREKUENSI.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="block text-sm font-semibold">Platform yang paling sering digunakan<select className={inputClass} value={form.platformSekarang} onChange={(event) => set("platformSekarang", event.target.value)}><option value="">Pilih platform</option>{PLATFORM_SAAT_INI.map((value) => <option key={value}>{value}</option>)}</select></label>
          </div>}

          {step === 1 && <div className="space-y-6">{CRITERIA.map((criterion) => <div key={criterion.key}><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold">{criterion.label}</p><p className="mt-1 text-xs text-muted-foreground">{criterion.question}</p></div><span className="rounded-lg bg-neon/10 px-2.5 py-1 text-sm font-bold text-neon">{form.ratings[criterion.key]}/5</span></div><div className="mt-4 grid grid-cols-5 gap-2">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => set("ratings", { ...form.ratings, [criterion.key]: value })} className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${form.ratings[criterion.key] === value ? "border-neon bg-neon text-primary-foreground" : "border-border bg-surface-2/40 hover:border-neon"}`}>{value}</button>)}</div><div className="mt-1 flex justify-between text-[11px] text-muted-foreground"><span>Tidak penting</span><span>Sangat penting</span></div></div>)}</div>}

          {step === 2 && <div className="space-y-6"><label className="block text-sm font-semibold">Anggaran berlangganan per bulan<select className={inputClass} value={form.budget} onChange={(event) => set("budget", event.target.value)}><option value="">Pilih anggaran</option>{BUDGET.map((value) => <option key={value}>{value}</option>)}</select></label><label className="block text-sm font-semibold">Aktivitas utama<select className={inputClass} value={form.aktivitas} onChange={(event) => set("aktivitas", event.target.value)}><option value="">Pilih aktivitas</option>{AKTIVITAS.map((value) => <option key={value}>{value}</option>)}</select></label></div>}

          {step === 3 && <div className="space-y-7"><div><p className="text-sm font-semibold">Fitur yang paling kamu butuhkan</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{FITUR.map((value) => <label className={optionClass} key={value}><input type="checkbox" checked={form.fiturPrioritas.includes(value)} onChange={(event) => set("fiturPrioritas", event.target.checked ? [...form.fiturPrioritas, value] : form.fiturPrioritas.filter((item) => item !== value))} />{value}</label>)}</div></div><div><p className="text-sm font-semibold">Model langganan yang diinginkan</p><div className="mt-3 grid gap-3">{MODEL.map((value) => <label className={optionClass} key={value}><input type="radio" name="modelLangganan" value={value} checked={form.modelLangganan === value} onChange={(event) => set("modelLangganan", event.target.value)} />{value}</label>)}</div></div></div>}

          {step === 4 && <div className="space-y-6"><div><p className="text-sm font-semibold">Perangkat utama untuk mendengarkan musik</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{PERANGKAT.map((value) => <label className={optionClass} key={value}><input type="radio" name="perangkat" value={value} checked={form.perangkat === value} onChange={(event) => set("perangkat", event.target.value)} />{value}</label>)}</div></div><label className="block text-sm font-semibold">Saran untuk platform musik ideal<textarea className={`${inputClass} min-h-32 resize-y`} value={form.saran} onChange={(event) => set("saran", event.target.value)} placeholder="Tulis masukanmu (opsional)" /></label></div>}

          {step === 5 && <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-surface-2/40 p-4 text-sm leading-relaxed"><input className="mt-1" type="checkbox" checked={form.setuju} onChange={(event) => set("setuju", event.target.checked)} />Saya bersedia jawaban kuesioner ini digunakan sebagai data penelitian. Data akan disimpan tanpa identitas sensitif.</label>}
        </section>

        <div className="mt-6 flex items-center justify-between gap-4"><button type="button" disabled={step === 0 || calculating} onClick={() => setStep((current) => current - 1)} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm transition hover:bg-surface disabled:invisible"><ArrowLeft className="h-4 w-4" /> Kembali</button>{step < SECTIONS.length - 1 ? <button type="button" disabled={!valid || calculating} onClick={() => setStep((current) => current + 1)} className="inline-flex items-center gap-2 rounded-full bg-neon px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">{section.next}<ArrowRight className="h-4 w-4" /></button> : <button type="button" disabled={!valid || calculating} onClick={submit} className="inline-flex items-center gap-2 rounded-full bg-neon px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">{calculating ? "Menganalisis..." : "Lihat rekomendasi"}<Check className="h-4 w-4" /></button>}</div>
      </div>
    </main>
  );
}