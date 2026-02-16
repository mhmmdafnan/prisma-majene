const LoadingDetail = ({ className = "" }) => {
  return (
    // Gunakan absolute agar menempel di container terdekat yang punya class 'relative'
    // Hilangkan 'fixed' dan 'inset-0' yang bikin full screen
    <div
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl ${className}`}
    >
      <div className="relative w-20 h-20">
        {/* Logo bouncing */}
        <img
          src="/favicon2.png"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 animate-spin"
          alt="Loading..."
        />
      </div>
      <div className="text-orange-600 text-sm font-bold animate-pulse">
        Memuat Data...
      </div>
    </div>
  );
};

export default LoadingDetail;
