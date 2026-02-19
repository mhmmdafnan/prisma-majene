"use client";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
  HiChartBar,
  HiDocumentSearch,
  HiDownload,
  HiOutlineLightBulb,
  HiOutlineLibrary,
  HiOutlineScale,
  HiOutlineTrendingUp,
} from "react-icons/hi";

export default function About() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      <Header />

      {/* HERO SECTION - Pake Navy Navy #001f3d biar Pro */}
      <div className="bg-[#001f3d] py-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 opacity-10 rounded-full -mr-48 -mt-48 blur-[100px]"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span className="text-orange-400 font-bold tracking-[0.3em] text-xs uppercase mb-4 block">
            {/* Edukasi & Metodologi Statistik {page ? ` - ${page}` : ""} */}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Mengenal IHK & Inflasi
          </h1>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed font-medium">
            Portal ini menyajikan data perkembangan harga konsumen di Kabupaten
            Majene yang merujuk pada standar manual internasional dan data resmi
            BPS.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 -mt-12 space-y-10 pb-24 relative z-20">
        {/* CARD 1: KONSEP DASAR (Bedah Materi PPT) */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600 shadow-sm shadow-orange-100">
              <HiOutlineLightBulb size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Konsep Dasar
              </h2>
              <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mt-1">
                Metodologi IHK
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-orange-600 flex items-center gap-2">
                <HiOutlineScale /> Apa itu IHK?
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed text-justify">
                <strong>Indeks Harga Konsumen (IHK)</strong> adalah angka yang
                mengukur rata-rata perubahan harga dari paket barang dan jasa
                (keranjang komoditas) yang dikonsumsi rumah tangga. Sejak
                Januari 2024, Majene menggunakan{" "}
                <strong>Tahun Dasar 2022 (2022=100)</strong> berdasarkan hasil
                Survei Biaya Hidup (SBH) terbaru.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-orange-600 flex items-center gap-2">
                <HiOutlineTrendingUp /> Apa itu Inflasi?
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed text-justify">
                <strong>Inflasi</strong> adalah kecenderungan harga-harga untuk
                naik secara umum dan terus menerus. Kenaikan harga satu atau dua
                barang saja tidak disebut inflasi, kecuali jika kenaikan itu
                meluas atau mengakibatkan kenaikan harga pada barang lainnya.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: INDIKATOR & KELOMPOK PENGELUARAN */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-4 mb-8 text-slate-900">
              <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                <HiChartBar size={32} />
              </div>
              <h2 className="text-2xl font-bold">Memahami Indikator</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "M-to-M",
                  full: "Month to Month",
                  desc: "Inflasi bulan ini dibanding bulan lalu. Menggambarkan gejolak harga jangka pendek.",
                },
                {
                  title: "Y-on-Y",
                  full: "Year on Year",
                  desc: "Inflasi bulan ini dibanding bulan yang sama tahun lalu. Indikator tren inflasi tahunan.",
                },
                {
                  title: "Y-to-D",
                  full: "Year to Date",
                  desc: "Akumulasi inflasi sejak Januari hingga bulan berjalan di tahun yang sama.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-200 transition-all group"
                >
                  <h4 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-4">
                    {item.full}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ASIDE: 11 KELOMPOK (DARI PPT) */}
          <div className="bg-[#001f3d] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
            <div className="absolute bottom-0 right-0 opacity-10">
              <HiOutlineLibrary size={120} />
            </div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <HiOutlineLibrary className="text-orange-500" /> 11 Kelompok Pengeluaran
            </h3>
            <ul className="space-y-3 text-[11px] text-slate-300 font-medium">
              <li className="flex gap-2">
                <span className="text-orange-500">01.</span> Makanan, Minuman &
                Tembakau
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">02.</span> Pakaian & Alas Kaki
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">03.</span> Perumahan, Air,
                Listrik & BB
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">04.</span> Perlengkapan Rumah
                Tangga
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">05.</span> Kesehatan
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">06.</span> Transportasi
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">07.</span> Informasi & Jasa
                Keuangan
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">08.</span> Pendidikan,
                Rekreasi & Olahraga
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">09.</span> Penyediaan Makanan
                & Akomodasi
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">10.</span> Jasa Lainnya
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">11.</span> Barang & Jasa
                Lainnya
              </li>
            </ul>
          </div>
        </div>

        {/* CARD 3: CARA PENGGUNAAN WEBSITE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-green-100 rounded-2xl text-green-600">
              <HiDocumentSearch size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Panduan Fitur Website
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                num: "1",
                title: "Dashboard Utama",
                desc: "Atur Tahun dan Bulan pada filter di atas. Sistem akan menampilkan ringkasan data IHK, Inflasi, dan Andil secara real-time.",
              },
              {
                num: "2",
                title: "Klik & Analisis Detail",
                desc: "Klik angka pada kartu inflasi untuk memunculkan tren grafik 12 bulan terakhir. Anda bisa melihat rincian hingga level komoditas.",
              },
              {
                num: "3",
                title: "Ekspor & Laporan",
                desc: "Klik ikon CSV untuk mendapatkan raw data tabel, atau ikon gambar (PNG) untuk menyimpan grafik guna keperluan presentasi.",
              },
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg mb-6 group-hover:bg-orange-500 transition-colors shadow-lg shadow-slate-200 group-hover:shadow-orange-200">
                  {step.num}
                </div>
                <h4 className="font-extrabold text-slate-900 mb-3">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed text-justify font-medium">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER INFO - Branding BPS */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-orange-200">
          <div className="text-white max-w-2xl">
            <h3 className="text-3xl font-black mb-4 tracking-tight">
              Data Resmi BPS Kabupaten Majene
            </h3>
            <p className="text-orange-50 text-sm leading-relaxed font-medium opacity-90">
              Seluruh data yang disajikan bersumber dari rilis Berita Resmi
              Statistik (BRS) BPS. Penghitungan menggunakan metode robust untuk
              menjamin anomali harga dapat diidentifikasi dan dikontrol secara
              ketat.
            </p>
          </div>
          <div className="bg-white/20 p-6 rounded-3xl backdrop-blur-md flex flex-col items-center">
            <HiDownload className="text-white text-4xl mb-2" />
            <span className="text-white font-bold text-[10px] uppercase tracking-widest">
              Satu Data Indonesia
            </span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
