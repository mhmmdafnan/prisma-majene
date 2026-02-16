"use client";
import Select from "react-select";

export default function FilterSelect({
  filter,
  options,
  value,
  onChange,
  error,
  ...props
}) {
  const selectOptions = options.map((item) =>
    typeof item === "object"
      ? { value: item.value, label: item.label }
      : { value: item, label: item },
  );

  return (
    <>
      {error && (
        <span className="text-[10px] font-bold text-red-500 mt-1 animate-pulse">
          * {error}
        </span>
      )}
      <label className="w-full">Pilih {filter} : </label>
      <Select
        options={selectOptions}
        onChange={(e) => onChange(e.value)}
        placeholder={`Pilih ${filter}...`}
        isSearchable
        className="w-full "
        value={selectOptions.find((opt) => opt.value == value) || null}
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? "#fff7ed" : "#fff", // orange-50
            borderColor: error
              ? "#ef4444"
              : state.isFocused
                ? "#f97316"
                : "#d1d5db", // orange-500 / gray-300
            borderWidth: "2px",
            borderRadius: "0.5rem",
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
    </>
  );
}
