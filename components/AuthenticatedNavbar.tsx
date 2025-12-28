"use client";

import { Home, Library, Plus, Bell, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import CustomPopup from "./CustomPopup";

export default function AuthenticatedNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showDraftPopup, setShowDraftPopup] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleCreateClick = () => {
    const currentDraft = localStorage.getItem("tomo_current_draft");
    if (currentDraft) {
      setShowDraftPopup(true);
    } else {
      router.push("/create-quiz");
    }
  };

  const handleContinueDraft = () => {
    setShowDraftPopup(false);
    router.push("/create-quiz");
  };

  const handleNewQuiz = () => {
    localStorage.removeItem("tomo_current_draft");
    setShowDraftPopup(false);
    router.push("/create-quiz");
  };

  return (
    <>
      <CustomPopup
        isOpen={showDraftPopup}
        type="confirm"
        title="Resume Draft?"
        message="You have an unfinished quiz draft. Would you like to continue where you left off?"
        confirmText="Yes, Continue"
        cancelText="No, Start New"
        onConfirm={handleContinueDraft}
        onCancel={handleNewQuiz}
        onClose={() => setShowDraftPopup(false)}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 pb-4">
        <div className="flex items-center justify-between px-6 h-16 max-w-lg mx-auto">
          {/* Left Icons */}
          <Link
            href="/home"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isActive("/home")
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <Home size={24} />
          </Link>
          <Link
            href="/my-quizzes"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isActive("/my-quizzes")
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <Library size={24} />
          </Link>

          {/* Center FAB */}
          <div className="relative -top-6 dark:bg-[#020617] dark:text-white p-2 rounded-full">
            <button
              onClick={handleCreateClick}
              className="w-14 h-14 rounded-full bg-blue-500 dark:bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={28} strokeWidth={2.5} />
            </button>
          </div>

          {/* Right Icons */}
          <Link
            href="/notifications"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isActive("/notifications")
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <Bell size={24} />
          </Link>
          <Link
            href="/profile"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isActive("/profile")
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <User size={24} />
          </Link>
        </div>
      </div>
    </>
  );
}
