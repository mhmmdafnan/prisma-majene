const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-24 h-24">
        {/* Outer spinning border */}
        {/* <div className="absolute inset-1 border-4 border-transparent p-10 border-t-[#FF9B00] rounded-full animate-spin"> */}
          {/* Inner spinning border */}
          {/* <div className="absolute inset-2 border-4 border-transparent p-10 border-t-[#FFC900] rounded-full animate-spin"></div> */}
        {/* </div> */}

        {/* Logo tetap diam di tengah */}
        <img
          src="/favicon2.png"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 duration-300 animate-bounce"
          alt="Loading..."
        />
      </div>
      <div className="text-white text-lg font-bold animate-pulse duration-75">Loading...</div>
    </div>
  );
};

export default Loading;
