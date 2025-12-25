"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function PlayPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            My Quiz Hub
          </h1>
          <button
            onClick={() => signOut(auth)}
            className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            Sign Out
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-colors group cursor-pointer">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📝</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Create New Quiz</h2>
            <p className="text-slate-400 text-sm">
              Design a new quiz about yourself to challenge your friends.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-colors group cursor-pointer">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-xl font-bold mb-2">My Quizzes</h2>
            <p className="text-slate-400 text-sm">
              View your created quizzes, check friend's scores, and see who
              knows you best.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
