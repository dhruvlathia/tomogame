"use client";

import { useState } from "react";
import { LuLayoutGrid } from "react-icons/lu";
import { RiNotification3Fill } from "react-icons/ri";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { X, User, Settings, HelpCircle, LogOut, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthenticatedTopbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
          className="font-bold text-blue-600 dark:text-blue-500 cursor-pointer hover:opacity-80 transition-opacity p-1 flex gap-2 items-center"
          aria-label="Open Menu"
        >
          <LuLayoutGrid size={24} />
          Menu
        </button>

        <div className="flex gap-2">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="font-bold text-blue-600 dark:text-blue-500 cursor-pointer hover:opacity-80 transition-opacity p-1 relative"
              aria-label="Notifications"
            >
              <RiNotification3Fill size={24} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-50 dark:border-slate-900"></span>
            </button>

            {/* Notification Popup */}
            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Notifications
                    </h3>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                      {notifications.filter((n) => n.unread).length} New
                    </span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer ${
                            notif.unread
                              ? "bg-blue-50/30 dark:bg-blue-900/10"
                              : ""
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                notif.unread
                                  ? "bg-blue-500"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                            <div>
                              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-1 leading-snug">
                                {notif.text}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">
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
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                    <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                      Mark all as read
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Image and Name */}
          {/* <div className="flex items-center gap-2">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Welcome
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Online
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          </div> */}
        </div>
      </header>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity duration-300 ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-slate-950 z-[51] shadow-2xl transform transition-transform duration-300 ease-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">🎮</span> TomoGame
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
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
              className="w-full py-2.5 px-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 group cursor-pointer"
            >
              <LogOut
                size={18}
                className="group-hover:-translate-x-0.5 transition-transform"
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
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-medium transition-all text-left group cursor-pointer"
    >
      <span className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
        {icon}
      </span>
      {label}
    </button>
  );
}
