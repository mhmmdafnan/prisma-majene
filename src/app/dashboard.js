"use client";
import { useEffect, useRef, useState,  } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);
import { FaFileCsv, FaFileImage } from "react-icons/fa6";

import dynamic from "next/dynamic";
import Header from "../components/header";
import Footer from "../components/footer";
const Loading = dynamic(() => import("@/components/Loading"), {
  ssr: false,
});
const LoadingDetail = dynamic(() => import("@/components/LoadingDetail"), {
  ssr: false,
});
const FilterSelect = dynamic(() => import("@/components/FilterSelect"), {
  ssr: false,
});

const ValueContainer = dynamic(() => import("@/components/valueContainer"), {
  ssr: false,
});

import TopAndilChart from "@/components/TopAndilInflasi";
// import { androiddeviceprovisioning } from "googleapis/build/src/apis/androiddeviceprovisioning";

export function transformAndil(data, tahun, bulan, indikator) {
  // Filter data sesuai tahun & bulan
  const filtered = data.filter(
    (item) =>
      String(item.Tahun) === String(tahun) &&
      String(item.Bulan) === String(bulan),
  );

  // Tentukan key yang dipakai berdasarkan indikator
  let key = "";
  if (indikator === "Inflasi MtM") {
    key = "Andil MtM";
  } else if (indikator === "Inflasi YoY") {
    key = "Andil YoY";
  } else if (indikator === "Inflasi YtD") {
    key = "Andil YtD";
  }

  // Mapping hasil
  const mapped = filtered.map((item) => ({
    nama: item["Nama Komoditas"],
    andil: parseFloat(item[key]) || 0,
  }));

  // Urutkan desc & ambil top 10
  return mapped.sort((a, b) => b.andil - a.andil);
}

export default function Dashboard() {
  const now = new Date();
  const currentYear = String(now.getFullYear()); // 2025
  const currentMonth = now.getMonth() + 1; // dari 0–11 jadi 1–12
  const [errors, setErrors] = useState({});

  const [komoditas, setKomoditas] = useState([]);
  const [values, setValues] = useState({
    "Inflasi MtM": null,
    "Inflasi YoY": null,
    "Inflasi YtD": null,
    IHK: null,
  });
  const [prevValues, setPrevValues] = useState({
    "Inflasi MtM": null,
    "Inflasi YoY": null,
    "Inflasi YtD": null,
    IHK: null,
  });
  const router = useRouter();
  const [tahun, setTahun] = useState([]);
  const [bulan, setBulan] = useState([]);
  const [selectedKomoditas, setSelectedKomoditas] = useState("UMUM");
  const [selectedTahun, setSelectedTahun] = useState(now.getFullYear());
  const [selectedBulan, setSelectedBulan] = useState(now.getMonth());
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dataGraph, setDataGraph] = useState([]);
  const [activeTab, setActiveTab] = useState("grafik");
  const [selectedItem, setSelectedItem] = useState(3);
  const [selectedIndicator, setSelectedIndicator] = useState("Inflasi YoY");
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [loadingAndil, setLoadingAndil] = useState(true);
  const [page, setPage] = useState(searchParams.get("page"));
  const [dataKey, setDataKey] = useState("");

  const targetMin = 1.5;
  const targetMax = 3.5;

  const namaBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const getNamaBulan = (angka) => namaBulan[angka - 1];

  const lineChartRef = useRef(null);

  const getDefaultKey = (page, selectedIndicator) => {
    // if (page === "harga") return "Harga";
    if (page === "ihk") return "IHK";
    return selectedIndicator || "Inflasi MtM"; // fallback kalau dashboard utama
  };

  const isFilterReady =
    Boolean(selectedKomoditas) &&
    Boolean(selectedTahun) &&
    Boolean(selectedBulan);

  // Fungsi download grafik PNG
  const downloadLineChart = () => {
    if (!lineChartRef.current) return;
    const link = document.createElement("a");
    link.download = `grafik_${selectedIndicator.replace(
      /\s+/g,
      "_",
    )}_${selectedKomoditas}.png`;
    link.href = lineChartRef.current.toBase64Image();
    link.click();
  };

  // Fungsi download data CSV
  const downloadLineCSV = () => {
    if (!dataGraph || dataGraph.length === 0) return;

    const headers = ["Tahun", "Bulan", selectedIndicator];
    const rows = dataGraph.map((d) => [d.Tahun, d.Bulan, d[selectedIndicator] || 0]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(";")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `data_${selectedIndicator.replace(
      /\s+/g,
      "_",
    )}_${selectedKomoditas}.csv`;
    link.click();
  };

  const normalizeNumber = (val) => {
    if (!val) return 0;
    return (
      Number(
        String(val)
          .replace(/[^\d,-]/g, "") // hapus semua kecuali angka, koma, minus
          .replace(/\./g, "") // hapus titik (ribuan)
          .replace(",", "."), // ganti koma jadi titik desimal
      ) || 0
    );
  };
  

  const sortedGraph = [...dataGraph].sort((a, b) => {
    const yearA = Number(a.Tahun),
      yearB = Number(b.Tahun);
    const monthA = Number(a.Bulan),
      monthB = Number(b.Bulan);
    return yearA !== yearB ? yearA - yearB : monthA - monthB;
  });

  const chartData = {
    // labels: sortedGraph.map((d) => `${d.Bulan}/${d.Tahun}`),
    labels: sortedGraph.map((item) => `${namaBulan[item.Bulan - 1]} ${item.Tahun}`),
    datasets: [
      {
        label: dataKey,
        data: sortedGraph.map((d) => {
          const raw = d[dataKey];
          if (!raw) return null;

          // Hapus koma ribuan
          const cleaned = String(raw).replace(/,/g, "");
          const num = Number(cleaned);

          return isNaN(num) ? null : num;
        }),
        pointRadius: 4,
        borderColor: "#f97316",
        backgroundColor: "#fdba74",
        tension: 0.4,
        borderWidth: 6,
      },
      // Target MIN
      ...(selectedIndicator === "Inflasi YoY"
        ? [
            {
              label: "Batas bawah pengendalian inflasi daerah",
              data: sortedGraph.map(() => targetMin),
              borderColor: "#22c55e",
              borderDash: [4, 4],
              pointRadius: 0,
              borderWidth: 3,
              fill: false,
            },
            {
              label: "Batas atas pengendalian inflasi daerah",
              data: sortedGraph.map(() => targetMax),
              borderColor: "#22c55e",
              borderDash: [4, 4],
              pointRadius: 0,
              borderWidth: 3,
              fill: false,
            },
          ]
        : []),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top", // top | bottom | left | right
        labels: {
          color: "#111",
          font: {
            size: 12,
            weight: "600",
          },
          usePointStyle: true, // 🔥
          pointStyle: "line", //
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        title: {
          display: true, // harus true supaya muncul
          text: "Bulan", // label sumbu X
          color: "#111",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        ticks: { font: { size: 12 } },
        grid: { color: "#e5e7eb" },
      },
      y: {
        title: {
          display: true,
          text: dataKey,
          color: "#111",
          font: { size: 14, weight: "bold" },
        },
        ticks: { font: { size: 12 } },
        grid: { color: "#e5e7eb" },
        beginAtZero: false,
        suggestedMin: Math.min(
          ...dataGraph.map((d) => Number(d[dataKey]) || 0),
        ),
        suggestedMax: Math.max(
          ...dataGraph.map((d) => Number(d[dataKey]) || 0),
        ),
      },
    },
  };

  const topAndil = transformAndil(
    data,
    selectedTahun,
    selectedBulan,
    selectedIndicator,
  );
  // const [topAndil, setTopAndil] = useState([]);

  let titleHeader = "";
  let content = [];
  if (page === "ihk") {
    titleHeader = "Dashboard IHK";
    content = [
      { title: "IHK", value: values["IHK"], prevValue: prevValues["IHK"] },
      {
        title: "Inflasi M-to-M",
        value: values["Inflasi MtM"],
        prevValue: prevValues["Inflasi MtM"],
      },
    ];
  } else {
    // fallback kalau bukan harga/ihk
    titleHeader = "Halaman Utama Dashboard";
    content = [
      {
        title: "Inflasi M-to-M",
        kode: "Inflasi MtM",
        value: values["Inflasi MtM"],
        prevValue: prevValues["Inflasi MtM"],
      },
      {
        title: "Inflasi Y-to-D",
        kode: "Inflasi YtD",
        value: values["Inflasi YtD"],
        prevValue: prevValues["Inflasi YtD"],
      },
      {
        title: "Inflasi Y-on-Y",
        kode: "Inflasi YoY",
        value: values["Inflasi YoY"],
        prevValue: prevValues["Inflasi YoY"],
      },
      {
        title: "IHK",
        kode: "IHK",
        value: values["IHK"],
        prevValue: prevValues["IHK"],
      },
    ];
  }

  const onDetailValueKlik = (item) => {
    // const slug = item.title.toLowerCase().replace(/\s+/g, "-");
    if (item === "IHK") item = "IHK";
    if (item === "Inflasi Y-on-Y") item = "Inflasi YoY";
    if (item === "Inflasi Y-to-D") item = "Inflasi YtD";
    if (item === "Inflasi M-to-M") item = "Inflasi MtM";

    router.push(`/detail?item=${encodeURIComponent(item)}`);
  };

  const getFilters = async () => {
    // setLoading(true); // mulai loading
    const res = await fetch(`/api/getFilter`);
    const result = await res.json();

    // setKomoditas(result.komoditas);
    setTahun(result.tahun);
    const bulanOptions = result.bulan
      .map((b) => ({
        value: b,
        label: getNamaBulan(b),
      }))
      .sort((a, b) => a.value - b.value);
    setBulan(bulanOptions);
    // setLoading(false); // selesai loading
  };

  const getData = async () => {
    setLoadingAndil(true);
    try {
      const res = await fetch(
        `/api/getAndil?flag=${selectedItem}&tahun=${selectedTahun}&bulan=${selectedBulan}`,
      );
      const result = await res.json();
      // console.log(result);
      if (result && Array.isArray(result)) {
        // setTopAndil(transformAndil(result, selectedTahun, selectedBulan, selectedIndicator));
        setData(result);
      } else {
        setData([]);
      }
      // setData(result);
    } catch (error) {
      console.error("Gagal ambil data:", error);
      setData([]);
    } finally {
      setLoadingAndil(false);
    }
  };

  const selectFilterHandle = async () => {
    const res = await fetch(
      `/api/filteredData?nama=${selectedKomoditas}&tahun=${selectedTahun}&bulan=${selectedBulan}`,
    );
    const result = await res.json();
    if (result && result.graph && result.filtered) {
      setDataGraph(result.graph);
      setValues({
        "Inflasi MtM": result.filtered["Inflasi MtM"],
        "Inflasi YoY": result.filtered["Inflasi YoY"],
        "Inflasi YtD": result.filtered["Inflasi YtD"],
        IHK: result.filtered["IHK"],
        // Harga: result.filtered["Harga"],
      });

      setPrevValues({
        "Inflasi MtM": result.prev?.["Inflasi MtM"],
        "Inflasi YoY": result.prev?.["Inflasi YoY"],
        "Inflasi YtD": result.prev?.["Inflasi YtD"],
        IHK: result.prev?.["IHK"],
        // Harga: result.prev?.["Harga"],
      });
    } else {
      setDataGraph([]);
      setValues({
        "Inflasi MtM": null,
        "Inflasi YoY": null,
        "Inflasi YtD": null,
        IHK: null,
        // Harga: null,
      });
      setPrevValues({
        "Inflasi MtM": null,
        "Inflasi YoY": null,
        "Inflasi YtD": null,
        IHK: null,
        // Harga: null,
      });
    }
  };

  const onfilterKlik = async () => {
    setLoading(true);
    try {
      await selectFilterHandle();
      await getData();
    } catch (error) {
      console.error("Error saat filter:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pertama kali load → ambil filters
  useEffect(() => {
    const fetchFilters = async () => {
      setLoading(true);
      await getFilters();
      await selectFilterHandle();
      await getData();
      // await getData();
      setLoading(false);
    };
    fetchFilters();
  }, []);

  // Kalau filter berubah → ambil data
  useEffect(() => {
    // if (!isFilterReady) return;

    const fetchFilteredData = async () => {
      setLoading(true);
      await selectFilterHandle();
      await getData();
      setLoading(false);
    };

    fetchFilteredData();
  }, [selectedBulan, selectedTahun]);

  useEffect(() => {
    const currentPage = searchParams.get("page");
    setPage(currentPage);

    const newKey = getDefaultKey(currentPage, selectedIndicator);
    setDataKey(newKey);

    // fetch graph khusus halaman harga / ihk
    if (currentPage) {
      setLoading(true);
      getData().finally(() => setLoading(false));
    }
  }, [searchParams, selectedIndicator]);
  // Di dalam komponen utama lo
  useEffect(() => {
    if (selectedItem) {
      getData(); // Fungsi khusus ambil data andil saja
    }
  }, [selectedItem]); // Trigger jalan setiap selectedItem berubah

  return (
    // <div className="bg-gradient-to-br from-[#f8e269] via-[#fff7cf] to-[#FF9B00]">
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      <Header />
      {loading && <Loading />}

      <main className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:items-center justify-between gap-4">
          <div className="">
            <h1 className="text-3xl text-slate-900 font-bold tracking-tight">
              {titleHeader}
            </h1>
          </div>

          {/* Filter Minimalis - Tidak lagi pakai BG Orange blok, tapi pakai border accent */}
          <div className=" bg-white border-l-4 border-orange-500 shadow-sm rounded-xl p-4 gap-4 items-end">
            <div className="grid grid-cols-2 gap-3">
              <FilterSelect
                filter="Tahun"
                options={tahun}
                onChange={(v) => {
                  setSelectedTahun(v);
                  // onfilterKlik();
                }}
                value={selectedTahun}
                error={errors.tahun}
              />
              <FilterSelect
                filter="Bulan"
                options={bulan}
                onChange={(v) => {
                  setSelectedBulan(v);
                  // onfilterKlik();
                }}
                value={selectedBulan}
                error={errors.bulan}
              />
            </div>
            <div className="flex items-center justify-end mt-4 gap-4">
              <button
                onClick={() => onfilterKlik()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-orange-200 cursor-pointer"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>

        {/* Stat Cards - Grid yang lebih lega */}
        <div className="grid :grid-cols-2 lg:grid-cols-4 gap-6">
          {content.map((item, idx) => (
            <ValueContainer
              key={idx}
              title={item.title}
              value={item.value}
              prevValue={item.prevValue}
              onClick={() => onDetailValueKlik(item.title)}
              // Pastikan di dalam ValueContainer, lo kasih hover effect: hover:border-orange-500
              warna={
                "bg-white border border-slate-100 shadow-sm hover:shadow-md "
              }
            />
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          {/* Tab Switcher - Style disamakan dengan dashboard utama lo */}
          <div className="flex bg-slate-50 p-1.5 gap-1 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("grafik")}
              className={`cursor-pointer flex-1 md:flex-none px-6 md:px-8 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === "grafik"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              Grafik
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`cursor-pointer flex-1 md:flex-none px-6 md:px-8 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === "data"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              Data Tabel
            </button>
          </div>

          <div className="p-4 md:p-8">
            {dataGraph?.length > 0 ? (
              <>
                {/* Header Section */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-lg md:text-xl text-slate-800 font-extrabold tracking-tight">
                      {activeTab === "grafik" ? "Visualisasi" : "Rincian"}{" "}
                      {selectedIndicator
                        ? content.find((c) => c.kode == selectedIndicator)
                            ?.title
                        : "Data"}
                    </h2>
                    <p className="text-slate-500 text-xs md:text-sm font-medium">
                      Periode{" "}
                      {selectedBulan ? getNamaBulan(selectedBulan) + " " : ""}{" "}
                      {selectedTahun}
                    </p>
                  </div>

                  <div className="flex w-full md:w-auto gap-2">
                    <button
                      onClick={downloadLineChart}
                      className="flex-1 md:flex-none cursor-pointer flex items-center justify-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 px-4 py-2 rounded-xl text-[10px] md:text-sm font-bold transition-colors hover:bg-orange-100"
                    >
                      <FaFileImage className="text-sm md:text-base" /> Grafik
                    </button>
                    <button
                      onClick={downloadLineCSV}
                      className="flex-1 md:flex-none cursor-pointer flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] md:text-sm font-bold transition-colors hover:bg-slate-900"
                    >
                      <FaFileCsv className="text-sm md:text-base" /> CSV
                    </button>
                  </div>
                </div>

                <div className="mb-6 flex justify-end">
                  <FilterSelect
                    filter="Indikator"
                    options={content.map((c) => c.kode)}
                    onChange={(v) => setSelectedIndicator(v)}
                    value={selectedIndicator}
                    error={errors.tipe}
                  />
                </div>

                {/* Tab Content */}
                <div className="relative w-full min-h-[300px] md:min-h-[450px]">
                  {activeTab === "grafik" ? (
                    /* TAB 1: GRAFIK */
                    <div className="h-[300px] lg:h-[450px]">
                      <Line
                        ref={lineChartRef}
                        data={chartData}
                        options={{
                          ...chartOptions,
                          maintainAspectRatio: false,
                          responsive: true,
                        }}
                      />
                    </div>
                  ) : (
                    /* TAB 2: DATA (TABEL) - Header Orange sesuai style lo */
                    <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
                      <table className="w-full text-left text-xs md:text-sm border-collapse">
                        <thead>
                          <tr className="bg-orange-500 text-white">
                            <th className="p-4 font-bold uppercase tracking-wider">
                              Periode
                            </th>
                            <th className="p-4 text-right font-bold uppercase tracking-wider text-white">
                              Nilai {selectedIndicator}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {dataGraph.map((item, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-orange-50/50 transition-colors group"
                            >
                              <td className="p-4 font-semibold text-slate-700">
                                {item["Bulan"]
                                  ? getNamaBulan(item["Bulan"]) +
                                    " " +
                                    item["Tahun"]
                                  : "-"}
                              </td>
                              <td className="p-4 text-right">
                                <span className="inline-block px-3 py-1 rounded-lg bg-orange-50 text-orange-700 font-bold font-mono">
                                  {item[selectedIndicator] || "-"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="italic text-sm font-medium">
                  Belum ada data yang ditampilkan / data belum tersedia.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Chart */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 md:p-8">
          {dataGraph?.length > 0 ? (
            <div className="w-full">
              <FilterSelect
                filter="Andil"
                options={[
                  { value: "1", label: "Kelompok Pengeluaran" },
                  { value: "2", label: "Sub Kelompok Pengeluaran" },
                  { value: "3", label: "Komoditas" },
                ]}
                onChange={(v) => {
                  setSelectedItem(v); // Cukup ini, useEffect akan otomatis jalan
                  if (errors.item)
                    setErrors((prev) => ({ ...prev, item: null }));
                }}
                value={selectedItem}
                error={errors.item}
              />
              <div className="mt-6">
                {loadingAndil ? (
                  <LoadingDetail className="flex items-center justify-center h-[300px] md:h-[450px]" />
                ) : (
                  <TopAndilChart data={topAndil} title={selectedIndicator} />
                )}
              </div>
            </div>
          ) : (
            <div className="py-10 flex items-center justify-center text-slate-400 italic text-sm">
              Belum ada data yang ditampilkan.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
