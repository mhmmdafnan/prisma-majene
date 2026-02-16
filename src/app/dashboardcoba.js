"use client";
import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [item, setItem] = useState(null);
  const [data, setData] = useState(null);
  const [filterTahun, setFilterTahun] = useState([]);
  const [filterBulan, setFilterBulan] = useState([]);
  const [selectedItem, setSelectedItem] = useState();
  const [selectedTahun, setSelectedTahun] = useState(new Date().getFullYear());
  const [selectedBulan, setSelectedBulan] = useState(new Date().getMonth());
  const [filterType, setFilterType] = useState(1);
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
    console.log("Selected filter type:", pilihFilter);
    setFilterType(pilihFilter);
    const res = await fetch(`/api/flag?flag=${pilihFilter}`);
    const data = await res.json();

    // Implement further actions based on selected filter type
  };

  const getFilterPeriode = async () => {
    try {
      const response = await fetch("/api/getFilter");
      const data = await response.json();
      console.log(data.bulan);
      console.log(data.tahun);

      setFilterBulan(data.bulan);
      setFilterTahun(data.tahun);
    } catch (error) {
      console.error("Error fetching filter periode data:", error);
    }
  };

  const getData = async () => {
    try {
      const response = await fetch(
        `/api/filteredData?nama=${selectedItem}&tahun=${selectedTahun}&bulan=${selectedBulan}`,
      );
      const data = await response.json();
      setData(data);

      console.log("ok siap tampil", data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getFilterItem();
    getFilterPeriode();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {/* <form onSubmit={() => getData()}> */}
      <div>
        <div>
          <label>Pilih Tahun: </label>
          <select
            name="pilihTahun"
            id="pilihTahun"
            onChange={(e) => setSelectedTahun(e.target.value)}
          >
            {filterTahun.map((tahun, index) => (
              <option key={index} value={tahun}>
                {tahun}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Pilih Bulan: </label>
          <select
            name="pilihBulan"
            id="pilihBulan"
            onChange={(e) => setSelectedBulan(e.target.value)}
          >
            {filterBulan.map((bulan, index) => (
              <option key={index} value={bulan}>
                {namaBulan[bulan - 1]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Pilih Filter : </label>
          <select
            name="pilihFilter"
            id="pilihFilter"
            onChange={(e) => onFilterClick(e.target.value)}
          >
            <option value={1}>Kelompok</option>
            <option value={2}>Sub-Kelompok</option>
            <option value={3}>Komoditas</option>
          </select>
        </div>
        {item && item.result && (
          <div>
            <label>Pilih Kelompok Komoditas: </label>
            <select onChange={(e) => setSelectedItem(e.target.value)}>
              {item.result.map((item, index) => (
                <option key={index}>{item}</option>
              ))}
            </select>
          </div>
        )}
        <button
          className="bg-amber-300 border-2 cursor-pointer"
          type="button"
          onClick={() => getData()}
        >
          Terapkan Filter
        </button>
      </div>

      <div>
        <h2>Data:</h2>
        {data && data.graph && (
          <ul>
            {data.graph.map(
              (item, index) =>
                item["Nama Komoditas"] && (
                  <div key={index}>
                    <li>
                      {item["Nama Komoditas"]} - {item["Tahun"]} -{" "}
                      {item["Bulan"]} : {item["IHK"]}
                    </li>
                  </div>
                ),
            )}
          </ul>
        )}
      </div>
      {/* Dashboard content goes here */}
    </div>
  );
}
