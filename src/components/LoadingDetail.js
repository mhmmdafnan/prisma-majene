const LoadingDetail = ({ className = "" }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
    >
      {/* Wrapper supaya logo bisa absolute */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        
        {/* Spinner */}
        <div className="absolute w-20 h-20 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>

        {/* Logo di tengah (tidak ikut muter) */}
        <img
          src="/favicon2.png"
          alt="Loading..."
          className="w-10 h-10"
        />
      </div>

      {/* Text */}
      <p className="mt-4 text-orange-600 text-sm font-semibold animate-pulse">
        Memuat Data...
      </p>
    </div>
  );
};

export default LoadingDetail;
