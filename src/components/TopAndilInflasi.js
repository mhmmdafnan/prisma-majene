"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useRef } from "react";
import { FaFileCsv, FaFileImage } from "react-icons/fa6";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function TopAndilInflasi({
  data = [],
  title = "",
  flagValue = "1",
}) {
  // Default array kosong
  const chartRef = useRef(null);

  // Jika data tidak ada, tampilkan pesan kosong (Placeholder)
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
        <p className="text-slate-400 font-medium">Data grafik tidak tersedia</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.nama || "Tanpa Nama"),
    datasets: [
      {
        label: "Andil Inflasi",
        data: data.map((d) => d.andil || 0),
        backgroundColor: "rgba(249, 115, 22, 0.8)", // Orange 500 dengan opacity
        hoverBackgroundColor: "#ea580c", // Orange 600
        borderRadius: 8, // Bikin ujung bar jadi membulat
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: "y", // Horizontal Bar
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b", // Slate 800
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (context) => ` Andil: ${context.parsed.x}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b" },
      },
      y: {
        grid: { color: "#f1f5f9" },
        ticks: {
          color: "#1e293b",
          font: { weight: "600" },
        },
      },
    },
  };

  const downloadChart = () => {
    if (!chartRef.current) return;
    const link = document.createElement("a");
    link.download = `Grafik_Andil_${title}.png`;
    link.href = chartRef.current.toBase64Image();
    link.click();
  };

  const downloadCSV = () => {
    const csvRows = [
      ["Nama", "Andil Inflasi"],
      ...data.map((d) => [d.nama, d.andil]),
    ];
    const csvString =
      "data:text/csv;charset=utf-8," +
      csvRows.map((e) => e.join(";")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvString);
    link.download = `Data_Andil_${title}.csv`;
    link.click();
  };

  return (
    <div className="bg-white p-2 md:p-0">
      {" "}
      {/* Tambah padding dikit di mobile biar gak nempel tembok */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Komoditas Penyumbang Inflasi
          </h2>
          <h2 className="text-xs md:text-sm text-slate-500 font-medium">
            Andil {title?.split(" ")[1] || "Inflasi"}
          </h2>
        </div>

        {/* Tombol dibuat full width di mobile biar gampang di-tap */}
        <div className="flex w-full md:w-auto gap-2">
          <button
            onClick={downloadChart}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 py-2 md:px-4 md:py-2.5 rounded-xl transition-all font-semibold cursor-pointer text-[10px] md:text-sm"
          >
            <FaFileImage className="text-base md:text-lg" /> Grafik
          </button>
          <button
            onClick={downloadCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 md:px-4 md:py-2.5 rounded-xl transition-all font-semibold cursor-pointer text-[10px] md:text-sm"
          >
            <FaFileCsv className="text-base md:text-lg" /> CSV
          </button>
        </div>
      </div>
  
      {/* Tinggi chart dibuat dinamis: 300px di HP, 450px di Desktop */}
      <div className="relative w-full h-[300px] md:h-[450px] bg-slate-50/30 rounded-2xl p-2 md:p-4 border border-slate-100 shadow-inner">
        <Bar
          ref={chartRef}
          data={chartData}
          options={{
            ...options,
            maintainAspectRatio: false, // Penting supaya chart ngikutin tinggi container
            responsive: true,
          }}
        />
      </div>
    </div>
  );
}
