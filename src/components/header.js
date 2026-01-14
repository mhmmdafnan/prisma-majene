"use client";

import {
  HiHome,
  HiChartSquareBar,
  HiCurrencyDollar,
  HiMenu,
  HiX,
} from "react-icons/hi";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "dashboard";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    {
      name: "Dashboard",
      icon: <HiHome size={18} />,
      href: "/",
      page: "dashboard",
    },
    {
      name: "IHK",
      icon: <HiChartSquareBar size={18} />,
      href: "/?page=ihk",
      page: "ihk",
    },
    // {
    //   name: "Harga",
    //   icon: <HiCurrencyDollar size={18} />,
    //   href: "/?page=harga",
    //   page: "harga",
    // },
  ];

  const renderLink = (item) => {
    const isActive = page === item.page;
    const baseClass = "flex items-center text-[#001f3d] gap-2 hover:text-[#FF9B00]";
    const activeClass = " text-[#FF9B00] font-semibold";
    return (
      <Link
        key={item.name}
        href={item.href}
        className={`${baseClass} ${isActive ? activeClass : ""}`}
        onClick={() => setMenuOpen(false)}
      >
        {item.icon} {item.name}
      </Link>
    );
  };

  return (
    <header
      className={`sticky top-2 z-50 mx-auto max-w-7xl rounded-2xl border border-[#001f3d]/10 backdrop-blur-sm shadow-2xl shadow-black/5 transition-colors duration-300 ${
        isScrolled ? "bg-transparent" : "bg-white/90 "
      }`}
    >
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="items-center">
            <img src="/images/Logo.png" className="w-40" alt="Logo" />
            {/* <img src="/favicon2.png" className="w-18" alt="Logo" /> */}
            {/* <div className="ml-3 flex flex-col">
              <span className="font-bold text-lg italic">
                
              </span>
            </div> */}
            <span className="text-xs text-[#001f3d] italic font-bold">PORTAL INFLASI MAJENE</span>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex space-x-6 items-center">
            {navItems.map(renderLink)}
          </nav>

          {/* Hamburger menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[#001f3d] focus:outline-none"
            >
              {menuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden mt-2 flex flex-col space-y-2">
            {navItems.map(renderLink)}
          </nav>
        )}
      </div>
    </header>
  );
}
