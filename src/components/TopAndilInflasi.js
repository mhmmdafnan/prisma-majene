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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
import { FaFileCsv, FaFileImage } from "react-icons/fa6";

export default function TopAndilInflasi({ data, title }) {
  const chartRef = useRef(null);

  const chartData = {
    labels: data.map((d) => d.nama),
    datasets: [
      {
        label: "Andil Inflasi",
        data: data.map((d) => d.andil),
        backgroundColor: "#fb923c", // orange-400
        borderColor: "#f97316", // orange-500
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#111",
        bodyColor: "#333",
        borderColor: "#f97316",
        borderWidth: 1,
      },
    },
    scales: {
      x: { grid: { color: "#e5e7eb" } },
      y: {
        grid: { color: "#f3f4f6" },
        ticks: { font: { size: 12 } },
      },
    },
  };

  // Fungsi download grafik PNG
  const downloadChart = () => {
    if (!chartRef.current) return;
    const link = document.createElement("a");
    link.download = "grafik_inflasi.png";
    link.href = chartRef.current.toBase64Image();
    link.click();
  };

  // Fungsi download data CSV
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
    link.download = "data_Andil_inflasi.csv";
    link.click();
  };

  return (
    <>
      {/* <div className="w-full h-[250px] sm:h-[350px] lg:h-[450px]"> */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mb-4 text-[#001f3d]">
          Komoditas Penyumbang Inflasi (Andil {title.split(" ")[1]})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={downloadChart}
            className="bg-[#FF9B00] hover:bg-[#FFC900] text-white px-4 w-fit py-2 rounded cursor-pointer"
          >
            <FaFileImage className="inline mr-1" /> Grafik
          </button>
          <button
            onClick={downloadCSV}
            className="bg-gray-700 text-white px-4 py-2 w-fit rounded cursor-pointer hover:bg-gray-800"
          >
            <FaFileCsv className="inline mr-1" /> Data CSV
          </button>
        </div>
      </div>
      <div style={{ width: "100%", height: 400 }}>
        <Bar
          ref={chartRef}
          data={chartData}
          options={{ ...options, maintainAspectRatio: false }}
        />
      </div>
      {/* </div> */}
    </>
  );
}
