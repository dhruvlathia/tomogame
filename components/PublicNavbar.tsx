"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import Link from "next/link";

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 relative z-50">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-2xl">🎮</span>
        </div>
        <span className="text-2xl font-black tracking-tighter text-white">
          TOMOGAME
        </span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
        <Link href="#" className="hover:text-white transition-colors">
          Features
        </Link>
        <Link href="#" className="hover:text-white transition-colors">
          How it Works
        </Link>
        <Link href="#" className="hover:text-white transition-colors">
          Community
        </Link>
        <Link href="#" className="hover:text-white transition-colors">
          Support
        </Link>
      </div>

      {/* Desktop Auth Button */}
      <div className="hidden md:block">
        {user ? (
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-all border border-slate-700"
          >
            Logout
          </button>
        ) : (
          <div className="w-[100px]"></div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden relative z-50 w-10 h-10 flex flex-col justify-center items-center gap-1.5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={`w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? "rotate-45 translate-y-2" : ""
          }`}
        ></span>
        <span
          className={`w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? "opacity-0" : ""
          }`}
        ></span>
        <span
          className={`w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? "-rotate-45 -translate-y-2" : ""
          }`}
        ></span>
      </button>

      {/* Mobile Fullscreen Menu */}
      <div
        className={`fixed inset-0 bg-[#020617]/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center transition-all duration-300 ${
          isOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center gap-8 text-xl font-bold text-white">
          <Link
            href="#"
            onClick={() => setIsOpen(false)}
            className="hover:text-blue-400 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#"
            onClick={() => setIsOpen(false)}
            className="hover:text-blue-400 transition-colors"
          >
            How it Works
          </Link>
          <Link
            href="#"
            onClick={() => setIsOpen(false)}
            className="hover:text-blue-400 transition-colors"
          >
            Community
          </Link>
          <Link
            href="#"
            onClick={() => setIsOpen(false)}
            className="hover:text-blue-400 transition-colors"
          >
            Support
          </Link>
          {user && (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="px-8 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all border border-slate-700 mt-4"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
