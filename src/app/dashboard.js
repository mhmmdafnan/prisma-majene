"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
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
  Legend
);
import { FaFileCsv, FaFileImage } from "react-icons/fa6";

import dynamic from "next/dynamic";
import Header from "../components/header";
import Footer from "../components/footer";
const Loading = dynamic(() => import("@/components/Loading"), {
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
      String(item.Bulan) === String(bulan)
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

  const [komoditas, setKomoditas] = useState([]);
  const [valueYoY, setValueYoY] = useState();
  const [valueMtM, setValueMtM] = useState();
  const [valueYtD, setValueYtD] = useState();
  const [valueIHK, setValueIHK] = useState();
  const [valueHarga, setValueHarga] = useState();
  const [tahun, setTahun] = useState([]);
  const [bulan, setBulan] = useState([]);
  const [selectedKomoditas, setSelectedKomoditas] = useState("UMUM");
  const [selectedTahun, setSelectedTahun] = useState(currentYear);
  const [selectedBulan, setSelectedBulan] = useState(String(currentMonth - 1));
  // const [selectedBulan, setSelectedBulan] = useState("7");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dataGraph, setDataGraph] = useState([]);

  const [selectedIndicator, setSelectedIndicator] = useState("Inflasi YoY");
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(searchParams.get("page"));
  const [dataKey, setDataKey] = useState("");

  const lineChartRef = useRef(null);

  const getDefaultKey = (page, selectedIndicator) => {
    if (page === "harga") return "Harga";
    if (page === "ihk") return "IHK";
    return selectedIndicator || "Inflasi YoY"; // fallback kalau dashboard utama
  };

  // Fungsi download grafik PNG
  const downloadLineChart = () => {
    if (!lineChartRef.current) return;
    const link = document.createElement("a");
    link.download = `grafik_${selectedIndicator.replace(
      /\s+/g,
      "_"
    )}_${selectedKomoditas}.png`;
    link.href = lineChartRef.current.toBase64Image();
    link.click();
  };

  // Fungsi download data CSV
  const downloadLineCSV = () => {
    if (!dataGraph || dataGraph.length === 0) return;

    const headers = ["Bulan", selectedIndicator];
    const rows = dataGraph.map((d) => [d.Bulan, d[selectedIndicator] || 0]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(";")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `data_${selectedIndicator.replace(
      /\s+/g,
      "_"
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
          .replace(",", ".") // ganti koma jadi titik desimal
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
    labels: sortedGraph.map((d) => `${d.Bulan}/${d.Tahun}`),
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
        borderColor: "#f97316",
        backgroundColor: "#fdba74",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
          text: dataKey, // label sumbu Y
          color: "#111",
          font: { size: 14, weight: "bold" },
        },
        ticks: { font: { size: 12 } },
        grid: { color: "#e5e7eb" },
        beginAtZero: false,
        suggestedMin:
          Math.min(...dataGraph.map((d) => Number(d[dataKey]) || 0)) - 10,
        suggestedMax:
          Math.max(...dataGraph.map((d) => Number(d[dataKey]) || 0)) + 10,
      },
    },
  };

  const topAndil = transformAndil(
    data,
    selectedTahun,
    selectedBulan,
    selectedIndicator
  );

  let titleHeader = "";
  let content = [];
  if (page === "harga") {
    titleHeader = "Dashboard Harga";
    content = [
      { title: "Harga", value: valueHarga },
      { title: "Inflasi M-to-M", value: valueMtM },
    ];
  } else if (page === "ihk") {
    titleHeader = "Dashboard IHK";
    content = [
      { title: "IHK", value: valueIHK },
      { title: "Inflasi M-to-M", value: valueMtM },
    ];
  } else {
    // fallback kalau bukan harga/ihk
    titleHeader = "Halaman Utama Dashboard";
    content = [
      { title: "Inflasi M-to-M", value: valueMtM },
      { title: "Inflasi Y-to-D", value: valueYtD },
      { title: "Inflasi Y-on-Y", value: valueYoY },
    ];
  }

  const getFilters = async () => {
    setLoading(true); // mulai loading
    const res = await fetch(`/api/getFilter`);
    const result = await res.json();
    setKomoditas(result.komoditas);
    setTahun(result.tahun);
    setBulan(result.bulan);
    setLoading(false); // selesai loading
  };

  const getData = async () => {
    const res = await fetch(
      `/api/filteredData?flag=1&tahun=${selectedTahun}&bulan=${selectedBulan}`
    );
    const result = await res.json();
    setData(result.graph);
  };

  const selectFilterHandle = async () => {
    const res = await fetch(
      `/api/filteredData?nama=${selectedKomoditas}&tahun=${selectedTahun}&bulan=${selectedBulan}`
    );
    const result = await res.json();
    console.log("filter", result.filtered);
    console.log("graph", result.graph);

    setFilteredData(result.filtered);
    setDataGraph(result.graph);
    setValueIHK(result.filtered["IHK"]);
    setValueHarga(result.filtered["Harga"]);
    setValueMtM(result.filtered["Inflasi MtM"]);
    setValueYoY(result.filtered["Inflasi YoY"]);
    setValueYtD(result.filtered["Inflasi YtD"]);
  };

  // Pertama kali load → ambil filters
  useEffect(() => {
    const fetchFilters = async () => {
      setLoading(true);
      await getFilters();
      setLoading(false);
    };
    fetchFilters();
  }, []);

  // Kalau filter berubah → ambil data
  useEffect(() => {
    if (selectedKomoditas && selectedTahun && selectedBulan) {
      const fetchData = async () => {
        setLoading(true);
        await selectFilterHandle();
        setLoading(false);
      };
      fetchData();
    }
  }, [selectedKomoditas, selectedTahun, selectedBulan]);

  // Kalau page/indikator berubah → set dataKey
  useEffect(() => {
    const currentPage = searchParams.get("page");
    setPage(currentPage);

    const newKey = getDefaultKey(currentPage, selectedIndicator);
    setDataKey(newKey);

    // kalau pindah page butuh data baru
    if (currentPage) {
      setLoading(true);
      getData().finally(() => setLoading(false));
    }
  }, [searchParams, selectedIndicator]);

  return (
    <div className="bg-gradient-to-b from-[#ffe97d9b] to-[#fcd498]">
      {/* <div className="p-6"> */}
      <Header />
      {/* </div> */}
      {loading && <Loading />}
      <div className="p-6 space-y-4 max-w-7xl min-h-screen mx-auto">
        <h1 className="text-2xl font-bold">{titleHeader}</h1>

        <div className="bg-white shadow-md rounded-2xl p-6 ">
          <h1 className="text-xl font-semibold mb-2">Filter</h1>
          <div className="flex flex-col gap-4 lg:flex-row justify-center items-center">
            {/* Filter Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:space-x-4 gap-4">
              <FilterSelect
                filter="Komoditas"
                options={komoditas}
                onChange={(value) => setSelectedKomoditas(value)}
                value={selectedKomoditas}
              />
              <FilterSelect
                filter="Tahun"
                options={tahun}
                onChange={(value) => setSelectedTahun(value)}
                value={selectedTahun}
              />
              <FilterSelect
                filter="Bulan"
                options={bulan}
                onChange={(value) => setSelectedBulan(value)}
                value={selectedBulan}
              />
              {!page && (
                <div className="flex flex-col gap-2">
                  <FilterSelect
                    filter="Indikator"
                    options={["Inflasi MtM", "Inflasi YoY", "Inflasi YtD"]}
                    onChange={(value) => setSelectedIndicator(value)}
                    value={selectedIndicator}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nilai Inflasi dll */}
        <div className="w-full flex justify-center items-center py-4">
          <div
            className={`grid gap-x-20 ${
              page ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"
            }`}
          >
            {content.map((item, idx) => (
              <ValueContainer key={idx} title={item.title} value={item.value} />
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white shadow-md rounded-2xl p-6 ">
          <div className="mb-4 flex flex-col md:flex-row justify-between items-center">
            <h2 className="text-xl font-semibold mb-4">
              Grafik {dataKey} Komoditas {selectedKomoditas} Bulan{" "}
              {selectedBulan} Tahun {selectedTahun}
            </h2>
            {dataGraph?.length > 0 ? (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={downloadLineChart}
                    className="bg-[#FF9B00] hover:bg-[#FFC900] text-white px-4 w-fit py-2 rounded cursor-pointer"
                  >
                    <FaFileImage className="inline mr-1" /> Grafik
                  </button>
                  <button
                    onClick={downloadLineCSV}
                    className="bg-gray-700 text-white px-4 py-2 w-fit rounded cursor-pointer hover:bg-gray-800"
                  >
                    <FaFileCsv className="inline mr-1" /> Data CSV
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-400">Belum ada data yang ditampilkan.</p>
            )}
          </div>

          {dataGraph?.length > 0 ? (
            <div style={{ width: "100%", height: 400 }}>
              <Line
                ref={lineChartRef}
                data={chartData}
                options={chartOptions}
              />
            </div>
          ) : (
            <p className="text-gray-400">Belum ada data yang ditampilkan.</p>
          )}
        </div>
        {!page && ( // hanya tampilkan kalau di halaman utama
          <div className="bg-white rounded-2xl p-6">
            <TopAndilChart data={topAndil} title={selectedIndicator} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
