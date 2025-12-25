"use client";

import { Home, Search, Plus, Bell, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthenticatedNavbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-4">
      <div className="flex items-center justify-between px-6 h-16 max-w-lg mx-auto">
        {/* Left Icons */}
        <Link
          href="/home"
          className={`p-2 rounded-xl transition-colors ${
            isActive("/home")
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <Home size={24} />
        </Link>
        <Link
          href="/search"
          className={`p-2 rounded-xl transition-colors ${
            isActive("/search")
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <Search size={24} />
        </Link>

        {/* Center FAB */}
        <div className="relative -top-6">
          <button className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all active:scale-95">
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>

        {/* Right Icons */}
        <Link
          href="/notifications"
          className={`p-2 rounded-xl transition-colors ${
            isActive("/notifications")
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <Bell size={24} />
        </Link>
        <Link
          href="/profile"
          className={`p-2 rounded-xl transition-colors ${
            isActive("/profile")
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <User size={24} />
        </Link>
      </div>
    </div>
  );
}
