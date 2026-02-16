"use client";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

import { Line } from "react-chartjs-2";

const Loading = dynamic(() => import("@/components/Loading"), {
  ssr: false,
});
const LoadingDetail = dynamic(() => import("@/components/LoadingDetail"), {
  ssr: false,
});
const FilterSelect = dynamic(() => import("@/components/FilterSelect"), {
  ssr: false,
});

// import TopAndilChart from "@/components/TopAndilInflasi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

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
    andil: parseFloat(item[key]) ? parseFloat(item[key]).toFixed(2) : 0,
  }));

  // Urutkan desc & ambil top 10
  return mapped.sort((a, b) => b.andil - a.andil);
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("data");
  const [tipe, setTipe] = useState(searchParams.get("item"));
  const [item, setItem] = useState(null);
  const [listData, setListData] = useState([]);
  const [dataGraph, setDataGraph] = useState([]);
  const [filterTahun, setFilterTahun] = useState([]);
  const [filterBulan, setFilterBulan] = useState([]);
  const [errors, setErrors] = useState({});

  const [selectedItem, setSelectedItem] = useState();
  const [selectedTahun, setSelectedTahun] = useState(new Date().getFullYear());
  const [selectedBulan, setSelectedBulan] = useState(new Date().getMonth());
  const [filterType, setFilterType] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingFilter, setLoadingFilter] = useState(false);
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
  const chartData = {
    labels: listData?.map(
      (item) => `${namaBulan[item.Bulan - 1]} ${item.Tahun}`,
    ),
    datasets: [
      {
        label: "Nilai",
        data: listData?.map((item) => item.nilai),
        pointRadius: 4,
        borderColor: "#f97316",
        backgroundColor: "#fdba74",
        tension: 0.4,
        borderWidth: 6,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Nilai: ${Number(ctx.raw).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Bulan", //
          color: "#111",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      y: {
        title: {
          display: true,
          text: `Nilai ${tipe}`,
          color: "#111",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        ticks: {
          callback: function (value) {
            return Number(value).toFixed(2);
          },
        },
      },
    },
  };

  const topAndil = transformAndil(
    dataGraph,
    selectedTahun,
    selectedBulan,
    tipe,
  );

  const getFilterItem = async () => {
    try {
      const response = await fetch("/api/getKelompok?flag=" + filterType);
      const data = await response.json();
      setItem(data);
    } catch (error) {
      console.error("Error fetching filter data:", error);
    }
  };

  const onFilterClick = async (pilihFilter) => {
    setFilterType(pilihFilter);
    const res = await fetch(`/api/flag?flag=${pilihFilter}`);
    const data = await res.json();

    // Implement further actions based on selected filter type
  };

  const getFilterPeriode = async () => {
    try {
      const response = await fetch("/api/getFilter");
      const data = await response.json();
      const bulanOptions = data.bulan
        .map((b) => ({
          value: b,
          label: namaBulan[b - 1],
        }))
        .sort((a, b) => a.value - b.value);
      setFilterBulan(bulanOptions);
      setFilterTahun(data.tahun);
    } catch (error) {
      console.error("Error fetching filter periode data:", error);
    }
  };

  // const getDataAndil = async () => {
  //   try {
  //     const res = await fetch(
  //       `/api/getAndil?flag=${flag}&tahun=${selectedTahun}&bulan=${selectedBulan}`,
  //     );
  //     const result = await res.json();
  //     console.log("andil ni", result);
  //     setDataGraph(result);
  //   } catch (error) {
  //     console.error("Gagal ambil data:", error);
  //     setDataGraph([]);
  //   }
  // };

  const getData = async () => {
    try {
      // const response = await fetch(
      //   `/api/filteredData?nama=${selectedItem}&tahun=${selectedTahun}&bulan=${selectedBulan}`,
      // );

      let url = "";
      let data = [];
      if (selectedItem) {
        url = `/api/getDataDetail?tipe=${tipe}&nama=${selectedItem}&tahun=${selectedTahun}&bulan=${selectedBulan}`;
        const response = await fetch(url);
        data = await response.json();
      }
      console.log("Response data:", data);
      if (data && Array.isArray(data)) {
        setListData(data);
      } else {
        setListData([]);
      }
      //   setListData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const onFilterSubmit = async () => {
    try {
      const newErrors = {};
      if (!selectedItem) newErrors.item = "Indikator harus dipilih";
      if (!selectedTahun) newErrors.tahun = "Tahun harus dipilih";
      if (!selectedBulan) newErrors.bulan = "Bulan harus dipilih";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        // Opsional: Scroll ke atas agar user lihat filternya
        return;
      }

      // Reset error jika validasi lolos
      setErrors({});
      await getData();
    } catch (error) {
      console.error("Error in onFilterSubmit:", error);
    }
  };

  useEffect(() => {
    const filterHendle = async () => {
      setLoading(true);
      await getData();
      setLoading(false);
    };
    filterHendle();
  }, [selectedBulan, selectedTahun, selectedItem]);

  useEffect(() => {
    const fetchInitialData = async () => {
      //   setLoadingFilter(true);
      await getFilterItem();
      await getFilterPeriode();
      //   setLoadingFilter(false);
    };
    fetchInitialData();
  }, [filterType]);

  return (
    // <div className="bg-gradient-to-br from-[#f8e269] via-[#fff7cf] to-[#FF9B00] min-h-screen">

    <div className="bg-[#F8FAFC] min-h-screen">
      <Header />
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* BREADCRUMB / HEADER */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl text-slate-900 font-bold tracking-tight">
            Dashboard {tipe}
          </h1>
          {/* <p className="text-slate-500 text-sm font-medium">
            Analisis data komoditas secara mendalam
          </p> */}
        </div>

        {/* FILTER BOX - Clean & Modern Style */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl ">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Parameter Filter
            </h2>
          </div>

          <div className="p-6">
            {/* Gunakan Grid dengan jumlah kolom tetap (4 kolom di layar besar) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              {/* Tahun */}
              <div className="flex flex-col">
                <FilterSelect
                  filter="Tahun"
                  options={filterTahun}
                  value={selectedTahun}
                  onChange={(value) => setSelectedTahun(value)}
                  error={errors.tahun}
                />
              </div>

              {/* Bulan */}
              <div className="flex flex-col">
                <FilterSelect
                  filter="Bulan"
                  options={filterBulan}
                  value={selectedBulan}
                  onChange={(value) => setSelectedBulan(value)}
                  error={errors.bulan}
                />
              </div>

              {/* Filter Type */}
              <div className="flex flex-col">
                <FilterSelect
                  filter="Tipe"
                  options={[
                    { value: 1, label: "Kelompok Pengeluaran" },
                    { value: 2, label: "Sub-Kelompok Pengeluaran" },
                    { value: 3, label: "Komoditas" },
                  ]}
                  value={filterType}
                  onChange={(value) => onFilterClick(value)}
                  error={errors.tipe}
                />
              </div>

              {/* Item Dinamis - Selalu dirender agar kolom ke-4 tidak hilang */}
              <div className="flex flex-col">
                {/* <label className="text-xs font-bold text-slate-500 mb-1.5 ml-1">
                  Pilih Item
                </label> */}
                <FilterSelect
                  filter="Item"
                  options={
                    item && item.result
                      ? item.result.map((itm, index) => ({
                          value: itm,
                          label: itm,
                        }))
                      : []
                  }
                  value={selectedItem}
                  onChange={(value) => setSelectedItem(value)}
                  error={errors.item}
                />
              </div>

              {/* Button Terapkan - ditaruh di bawah atau buat kolom baru */}
              <div className="lg:col-span-4 flex justify-end mt-2">
                <button
                  onClick={() => onFilterSubmit()}
                  className="cursor-pointer w-full lg:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-200"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* MAIN CONTENT CARD */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          {/* TABS CUSTOM */}
          <div className="flex bg-slate-50 p-1.5 gap-1 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("data")}
              className={`cursor-pointer flex-1 md:flex-none px-8 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === "data"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              Data Tabel
            </button>
            <button
              onClick={() => setActiveTab("grafik")}
              className={`cursor-pointer flex-1 md:flex-none px-8 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === "grafik"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              Grafik
            </button>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight leading-tight">
                Data {selectedItem} - {namaBulan[selectedBulan - 1]}{" "}
                {selectedTahun}
              </h2>
              <h2 className="text-xs text-slate-500 font-medium">
                Nilai {tipe} untuk {selectedItem}
              </h2>
            </div>
            {activeTab === "data" && (
              <div className="lg:h-[450px] space-y-4 p-4">
                {loading ? (
                  <LoadingDetail className="flex items-center justify-center h-full" />
                ) : (
                  <>
                    {Array.isArray(listData) && listData.length > 0 ? (
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="bg-orange-500 text-white">
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                                {filterType == 1
                                  ? "Kelompok"
                                  : filterType == 2
                                    ? "Sub-Kelompok"
                                    : "Komoditas"}
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                                Periode
                              </th>
                              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                                Nilai {tipe}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {listData.map((item, index) => (
                              <tr
                                key={index}
                                className="hover:bg-orange-50/50 transition-colors group"
                              >
                                <td className="px-6 py-4 font-semibold text-slate-700 group-hover:text-orange-600">
                                  {item.NamaKomoditas}
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">
                                  {namaBulan[item.Bulan - 1]} {item.Tahun}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className="inline-block px-3 py-1 rounded-lg bg-orange-50 text-orange-700 font-bold">
                                    {item.nilai}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium italic">
                          Belum ada data untuk ditampilkan / Data belum
                          tersedia.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "grafik" && (
              <div className="lg:h-[450px] w-full p-2">
                {loading ? (
                  <LoadingDetail className="flex items-center justify-center h-full" />
                ) : (
                  <>
                    {listData?.length > 0 ? (
                      <Line
                        data={chartData}
                        options={{
                          ...chartOptions,
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                        Belum ada data grafik / Data belum tersedia.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Chart */}
        {/* <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 md:p-8">
          {dataGraph?.length > 0 ? (
            <div className="w-full">
              <TopAndilChart data={topAndil} title={filterType === 1 ? "Kelompok" : filterType === 2 ? "Sub-Kelompok" : "Komoditas"} />
            </div>
          ) : (
            <div className="py-10 flex items-center justify-center text-slate-400 italic text-sm">
              Belum ada data yang ditampilkan.
            </div>
          )}
        </div> */}
      </div>
      <Footer />
    </div>
  );
}
