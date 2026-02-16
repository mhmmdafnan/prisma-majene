export default function ValueContainer({
  title,
  value,
  prevValue,
  onClick,
  warna,
}) {
  const formatValue = (val) => {
    if (!val) return "-";
    const cleaned = String(val).replace(/,/g, "");
    const num = Number(cleaned);
    if (isNaN(num)) return "-";

    if (title?.toLowerCase().includes("harga")) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(num);
    }

    return num.toFixed(2);
  };

  const parseNumber = (val) => {
    if (!val) return null;
    const cleaned = String(val).replace(/,/g, "");
    const num = Number(cleaned);
    return isNaN(num) ? null : num;
  };

  const current = parseNumber(value);
  const previous = parseNumber(prevValue);

  let diffText = "-";
  let diffClass = "text-gray-500";
  let diffIcon = null;

  if (current !== null && previous !== null) {
    const diff = current - previous;

    if (diff > 0) {
      diffText = `${diff.toFixed(2)}`;
      diffClass = "text-green-600";
      diffIcon = "arrow_warm_up";
    } else if (diff < 0) {
      diffText = `${Math.abs(diff).toFixed(2)}`;
      diffClass = "text-red-600";
      diffIcon = "arrow_cool_down";
    } else {
      diffText = "tidak berubah";
      diffIcon = "remove";
    }
  }

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden
        ${warna}
        outline-1 outline-[#FF9B00]/50
        shadow-2xl shadow-black/10
        rounded-2xl
        transition-all duration-300
        hover:scale-110
        hover:outline-2 hover:outline-[#FF9B00]
        flex flex-col items-center justify-center cursor-pointer`}
    >
      <p className="text-md text-[#001f3d] font-extralight px-4 pt-2">
        {title || "-"}
      </p>

      <div className="flex items-center justify-center text-4xl text-[#001f3d] py-6 px-5 w-60">
        <p className="font-semibold ">
          {formatValue(value)}{" "}
          <span className="opacity-60 text-[20px]">
            {title == "IHK" ? "" : "%"}
          </span>
        </p>
      </div>

      <div className={`flex items-center mb-2 px-2 gap-1 ${diffClass}`}>
        {diffIcon && (
          <span className="material-symbols-outlined text-sm">{diffIcon}</span>
        )}
        <span>
          {diffText} {title == "IHK" ? "poin" : "%"}
        </span>
      </div>

      {/* <div className="flex justify-end text-sm text-[#001f3d] px-4 py-2 hover:underline cursor-pointer">
      
        lihat detail &rarr;
      </div> */}
      {/* Overlay hover */}
      <div
        className="
          lg:absolute bottom-0 left-0 right-0
          bg-white/20 backdrop-blur-sm
          text-[#001f3d] font-medium
          py-3 text-center
          flex items-center justify-center
          transition-all duration-300
          opacity-100 translate-y-0       
          lg:opacity-0 lg:translate-y-4   
          lg:group-hover:opacity-100
          lg:group-hover:translate-y-0
        "
      >
        lihat detail →
      </div>
    </div>
  );
}
