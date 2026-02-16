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
    // {
    //   name: "IHK",
    //   icon: <HiChartSquareBar size={18} />,
    //   href: "/?page=ihk",
    //   page: "ihk",
    // },
    // {
    //   name: "Harga",
    //   icon: <HiCurrencyDollar size={18} />,
    //   href: "/?page=harga",
    //   page: "harga",
    // },
  ];

  const renderLink = (item) => {
    const isActive = page === item.page;
    const baseClass =
      "flex items-center text-[#001f3d] gap-2 hover:text-[#FF9B00]";
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
      className={`sticky top-0 z-50 transition-all duration-300
    ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-md" : "bg-white/90"}
  `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/images/Logo.png" className="w-14 sm:w-16" alt="Logo" />
            <span className="hidden sm:block text-xs text-[#001f3d] italic font-bold">
              PORTAL INFLASI MAJENE
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = page === item.page;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition
                ${
                  isActive
                    ? "text-[#FF9B00] border-b-2 border-[#FF9B00]"
                    : "text-[#001f3d] hover:text-[#FF9B00]"
                }
              `}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[#001f3d]"
            aria-label="Toggle menu"
          >
            {menuOpen ? <HiX size={26} /> : <HiMenu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden
      ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
    `}
      >
        <nav className="bg-white border-t border-[#001f3d]/10 px-4 py-3 space-y-2">
          {navItems.map((item) => {
            const isActive = page === item.page;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition
              ${
                isActive
                  ? "bg-[#fff7cf] text-[#FF9B00] font-semibold"
                  : "text-[#001f3d] hover:bg-gray-100"
              }
            `}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
