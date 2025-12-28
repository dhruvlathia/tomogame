"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import AuthenticatedNavbar from "@/components/AuthenticatedNavbar";
import AuthenticatedTopbar from "@/components/AuthenticatedTopbar";
import { Trash2, Edit3, Plus, Clock, Layout, BarChart3 } from "lucide-react";

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
      <div className="min-h-screen bg-slate-200 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-white pb-24 transition-colors duration-300">
      {/* Background Elements */}
      <div className="fixed inset-0 h-screen z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 dark:bg-blue-600/10 blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/5 dark:bg-purple-600/10 blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-5 mix-blend-overlay pointer-events-none"></div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 relative z-10">
        <AuthenticatedTopbar />

        <div className="space-y-8 mt-6">
          {/* Main Actions */}
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={handleCreateNew}
              className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 group cursor-pointer shadow-xl shadow-slate-300/50 dark:shadow-none hover:-translate-y-1 relative overflow-hidden"
            >
              {/* <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Plus size={100} />
              </div> */}
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <span className="text-2xl">📝</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Create Quiz
                </h2>
                {/* <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                  Design a new quiz about yourself to challenge your friends.
                </p> */}
              </div>
            </div>

            <div
              onClick={() => router.push("/my-quizzes")}
              className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 group cursor-pointer shadow-xl shadow-slate-300/50 dark:shadow-none hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                My Quizzes
              </h2>
              {/* <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                View your created quizzes, check friend's scores, and see who
                knows you best.
              </p> */}
            </div>
          </div>

          {/* Drafts Section */}
          {drafts.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock size={20} /> Saved Drafts
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    onClick={() => handleResumeDraft(draft)}
                    className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group shadow-lg shadow-slate-300/10 dark:shadow-none hover:shadow-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          draft.type === "quiz"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        }`}
                      >
                        {draft.type === "quiz" ? (
                          <Layout size={24} />
                        ) : (
                          <BarChart3 size={24} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold capitalize text-slate-900 dark:text-white">
                          {draft.type === "quiz"
                            ? "Interactive Quiz"
                            : "Opinion Survey"}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Last edited{" "}
                          {new Date(draft.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Resume"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResumeDraft(draft);
                        }}
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteDraft(e, draft.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
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
