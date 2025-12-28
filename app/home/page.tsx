"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import AuthenticatedNavbar from "@/components/AuthenticatedNavbar";
import AuthenticatedTopbar from "@/components/AuthenticatedTopbar";
import { Trash2, Edit3, Plus, Clock } from "lucide-react";

interface Draft {
  id: string;
  type: "quiz" | "survey";
  answers: Record<string, string>;
  lastUpdated: number;
}

export default function PlayPage() {
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      } else {
        // Load drafts
        const draftsJson = localStorage.getItem("tomo_quiz_drafts");
        if (draftsJson) {
          const draftsObj = JSON.parse(draftsJson);
          // Convert object to array and sort by lastUpdated desc
          const draftsList = Object.values(draftsObj) as Draft[];
          draftsList.sort((a, b) => b.lastUpdated - a.lastUpdated);
          setDrafts(draftsList);
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleCreateNew = () => {
    // Clear current draft to start fresh
    localStorage.removeItem("tomo_current_draft");
    router.push("/create-quiz");
  };

  const handleResumeDraft = (draft: Draft) => {
    // Set as current draft
    localStorage.setItem("tomo_current_draft", JSON.stringify(draft));
    router.push("/create-quiz");
  };

  const handleDeleteDraft = (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this draft?")) {
      const newDrafts = drafts.filter((d) => d.id !== draftId);
      setDrafts(newDrafts);

      // Update localStorage
      const draftsJson = localStorage.getItem("tomo_quiz_drafts");
      if (draftsJson) {
        const draftsObj = JSON.parse(draftsJson);
        delete draftsObj[draftId];
        localStorage.setItem("tomo_quiz_drafts", JSON.stringify(draftsObj));
      }

      // Also clear current draft if it matches
      const currentDraftJson = localStorage.getItem("tomo_current_draft");
      if (currentDraftJson) {
        const current = JSON.parse(currentDraftJson);
        if (current.id === draftId) {
          localStorage.removeItem("tomo_current_draft");
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white pb-24">
      <div className="max-w-4xl mx-auto p-6">
        <AuthenticatedTopbar />

        <div className="space-y-8">
          {/* Main Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div
              onClick={handleCreateNew}
              className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-colors group cursor-pointer shadow-sm dark:shadow-none relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Plus size={100} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📝</span>
                </div>
                <h2 className="text-xl font-bold mb-2">Create New Quiz</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Design a new quiz about yourself to challenge your friends.
                </p>
              </div>
            </div>

            <div
              onClick={() => router.push("/my-quizzes")}
              className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-colors group cursor-pointer shadow-sm dark:shadow-none"
            >
              <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-xl font-bold mb-2">My Quizzes</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                View your created quizzes, check friend's scores, and see who
                knows you best.
              </p>
            </div>
          </div>

          {/* Drafts Section */}
          {drafts.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock size={20} /> Saved Drafts
              </h3>
              <div className="grid gap-4">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    onClick={() => handleResumeDraft(draft)}
                    className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-blue-500/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          draft.type === "quiz"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        }`}
                      >
                        {draft.type === "quiz" ? (
                          <span className="text-lg">✨</span>
                        ) : (
                          <span className="text-lg">📊</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold capitalize">
                          {draft.type === "quiz"
                            ? "Interactive Quiz"
                            : "Opinion Survey"}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Last edited{" "}
                          {new Date(draft.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Resume"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteDraft(e, draft.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <AuthenticatedNavbar />
    </div>
  );
}
