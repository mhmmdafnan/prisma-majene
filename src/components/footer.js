"use client";

export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-md shadow-md px-6 py-2 mx-auto mt-10 rounded-2xl">
      <div className=" ">
        <div className="text-center text-xs text-gray-500">
          {/* Brand */}
          <div className=" mb-2 flex items-center justify-center gap-2">
            {/* <div className="flex flex-col items-center justify-center gap-2 mb-1">
              <img src="/images/Logo.png" className="w-10" alt="Logo" />
            </div> */}
            <p className="text-sm text-gray-400 ">
              © {new Date().getFullYear()} - Muhammad Afnan Falieh - BPS
              Kabupaten Majene
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
