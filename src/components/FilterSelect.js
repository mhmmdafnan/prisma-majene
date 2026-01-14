"use client";
import Select from "react-select";

export default function FilterSelect({ filter, options, value, onChange }) {
  const selectOptions = options.map((item) => ({
    value: item,
    label: item,
  }));

  return (
    <Select
      options={selectOptions}
      onChange={(e) => onChange(e.value)}
      placeholder={`Pilih ${filter}...`}
      isSearchable
      className="w-64"
      value={selectOptions.find((opt) => opt.value === value) || null}
      styles={{
        control: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? "#fff7ed" : "#fff", // orange-50
          borderColor: state.isFocused ? "#f97316" : "#d1d5db", // orange-500 / gray-300
          borderWidth: "2px",
          boxShadow: "none",
          "&:hover": {
            borderColor: "#ea580c", // orange-600
          },
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "#fb923c" // orange-400
            : state.isFocused
            ? "#fff7ed" // orange-50
            : "#fff",
          color: state.isSelected ? "#fff" : "#001f3d", // white / gray-900
          cursor: "pointer",
        }),
        placeholder: (base) => ({
          ...base,
          color: "#9ca3af", // gray-400
        }),
      }}
    />
  );
}
