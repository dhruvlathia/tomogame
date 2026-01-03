"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:py-8 max-w-7xl w-full mx-auto transition-colors duration-300">
      <Link href="/" className="flex items-center gap-2 relative z-50 group">
        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
          <span className="text-2xl">🎮</span>
        </div>
        <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
          TOMOGAME
        </span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
        <Link
          href="/features"
          className="hover:text-blue-600 dark:hover:text-white transition-colors"
        >
          Features
        </Link>
        <Link
          href="/how-it-works"
          className="hover:text-blue-600 dark:hover:text-white transition-colors"
        >
          How it Works
        </Link>
        <Link
          href="#"
          className="hover:text-blue-600 dark:hover:text-white transition-colors"
        >
          Community
        </Link>
        <Link
          href="/support"
          className="hover:text-blue-600 dark:hover:text-white transition-colors"
        >
          Support
        </Link>
      </div>

      {/* Desktop Auth Button & Theme Toggle */}
      <div className="hidden md:flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        {user ? (
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Logout
          </button>
        ) : (
          <div className="w-[10px]"></div>
        )}
      </div>

      {/* Mobile Menu Button & Theme Toggle */}
      <div className="flex items-center gap-3 md:hidden relative z-50">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}
        <button
          className="w-10 h-10 flex flex-col justify-center items-center gap-1.5 p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span
            className={`w-5 h-0.5 bg-slate-900 dark:bg-white transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`w-5 h-0.5 bg-slate-900 dark:bg-white transition-all duration-300 ${
              isOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`w-5 h-0.5 bg-slate-900 dark:bg-white transition-all duration-300 ${
              isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>
      </div>

      {/* Mobile Fullscreen Menu */}
      <div
        className={`fixed inset-0 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center transition-all duration-300 ${
          isOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center gap-8 text-xl font-bold text-slate-900 dark:text-white">
          <Link
            href="/features"
            onClick={() => setIsOpen(false)}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Features
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setIsOpen(false)}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            How it Works
          </Link>
          <Link
            href="#"
            onClick={() => setIsOpen(false)}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Community
          </Link>
          <Link
            href="/support"
            onClick={() => setIsOpen(false)}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Support
          </Link>
          {user && (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="px-8 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold transition-all shadow-lg mt-4"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
