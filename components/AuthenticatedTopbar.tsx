"use client";

import { useState } from "react";
import { LuLayoutGrid } from "react-icons/lu";
import { RiNotification3Fill } from "react-icons/ri";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  X,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Home,
  Sun,
  Moon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function AuthenticatedTopbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Mock notifications
  const notifications = [
    { id: 1, text: "New quiz available!", time: "2m ago", unread: true },
    { id: 2, text: "Friend request from Tom", time: "1h ago", unread: true },
    {
      id: 3,
      text: "You scored 80% in Math Quiz",
      time: "1d ago",
      unread: false,
    },
  ];

  return (
    <>
      <header className="flex justify-between items-center mb-6 relative z-40">
        {/* Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="font-bold text-slate-700 dark:text-white cursor-pointer hover:bg-white/50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-all flex gap-2 items-center"
          aria-label="Open Menu"
        >
          <div className="bg-blue-600 dark:bg-blue-500 text-white p-1 rounded-md">
            <LuLayoutGrid size={20} />
          </div>
          <span className="hidden sm:inline">Menu</span>
        </button>

        <div className="flex gap-3">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer shadow-sm relative"
              aria-label="Notifications"
            >
              <RiNotification3Fill size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-800 animate-pulse"></span>
            </button>

            {/* Notification Popup */}
            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="absolute right-0 top-14 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Notifications
                    </h3>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                      {notifications.filter((n) => n.unread).length} New
                    </span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer ${
                            notif.unread
                              ? "bg-blue-50/40 dark:bg-blue-500/5"
                              : ""
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                                notif.unread
                                  ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                            <div>
                              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-1 leading-snug">
                                {notif.text}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                {notif.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                        No new notifications
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-center">
                    <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer uppercase tracking-wide">
                      Mark all as read
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle Button - Improved Visibility */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-yellow-400 hover:border-orange-200 dark:hover:border-yellow-900 transition-all cursor-pointer shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/20 dark:bg-black/60 z-50 backdrop-blur-sm transition-opacity duration-300 ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-slate-950 z-[51] shadow-2xl transform transition-transform duration-300 ease-out border-r border-slate-200 dark:border-slate-800 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <span className="text-2xl">🎮</span> TomoGame
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <MenuItem icon={<Home size={20} />} label="Home" route="/home" />
            <MenuItem
              icon={<User size={20} />}
              label="Profile"
              route="/profile"
            />
            <MenuItem
              icon={<Settings size={20} />}
              label="Settings"
              route="/settings"
            />
            <MenuItem
              icon={<HelpCircle size={20} />}
              label="Help & Support"
              route="/help"
            />
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={() => {
                signOut(auth);
                setIsSidebarOpen(false);
              }}
              className="w-full py-3 px-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-500/30"
            >
              <LogOut
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function MenuItem({
  icon,
  label,
  route,
}: {
  icon: React.ReactNode;
  label: string;
  route: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(route)}
      className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-medium transition-all text-left group cursor-pointer"
    >
      <span className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors bg-slate-100 dark:bg-slate-900 p-2 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-sm">
        {icon}
      </span>
      {label}
    </button>
  );
}
