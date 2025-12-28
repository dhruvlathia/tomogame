"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AuthenticatedNavbar from "@/components/AuthenticatedNavbar";
import AuthenticatedTopbar from "@/components/AuthenticatedTopbar";
import { listenData, deleteData } from "@/lib/realtime";
import {
  Trash2,
  Calendar,
  Lock,
  Globe,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import CustomPopup from "@/components/CustomPopup";

interface PublishedQuiz {
  id: string;
  type: "quiz" | "survey";
  privacy: "public" | "private";
  createdAt: number;
  questions: any[];
  answers: Record<string, string>;
}

export default function MyQuizzesPage() {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<PublishedQuiz[]>([]);
  const [deletePopup, setDeletePopup] = useState<{
    isOpen: boolean;
    quizId: string | null;
  }>({
    isOpen: false,
    quizId: null,
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      } else {
        const unsubscribeData = listenData(`qs/${user.uid}`, (data) => {
          if (data) {
            const quizList = Object.entries(data).map(
              ([id, value]: [string, any]) => ({
                id,
                ...value,
              })
            );
            // Sort by createdAt desc
            quizList.sort((a, b) => b.createdAt - a.createdAt);
            setQuizzes(quizList);
          } else {
            setQuizzes([]);
          }
          setLoading(false);
        });

        return () => unsubscribeData();
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const handleDeleteClick = (quizId: string) => {
    setDeletePopup({ isOpen: true, quizId });
  };

  const confirmDelete = async () => {
    if (deletePopup.quizId && auth.currentUser) {
      try {
        await deleteData(`qs/${auth.currentUser.uid}/${deletePopup.quizId}`);
        setDeletePopup({ isOpen: false, quizId: null });
      } catch (error) {
        console.error("Error deleting quiz:", error);
        alert("Failed to delete quiz. Please try again.");
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white pb-24 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto p-6 relative z-10">
        <AuthenticatedTopbar />

        <div className="mt-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Quizzes
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Manage your published quizzes and surveys.
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center">
              <LayoutGrid
                className="text-blue-600 dark:text-blue-400"
                size={24}
              />
            </div>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl space-y-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <LayoutGrid className="text-slate-400" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">No quizzes yet</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  You haven't published any quizzes or surveys yet. Start
                  creating one now!
                </p>
              </div>
              <button
                onClick={() => router.push("/create-quiz")}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-600/20"
              >
                Create My First Quiz
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="group relative bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/30"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            quiz.type === "quiz"
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                              : "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                          }`}
                        >
                          {quiz.type}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {quiz.privacy === "public" ? (
                            <Globe size={14} />
                          ) : (
                            <Lock size={14} />
                          )}
                          {quiz.privacy}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {quiz.type === "quiz"
                          ? "Interactive Personality Quiz"
                          : "Opinion & Feedback Survey"}
                      </h2>

                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={16} />
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <LayoutGrid size={16} />
                          {quiz.questions?.length || 0} Questions
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDeleteClick(quiz.id)}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all cursor-pointer"
                        title="Delete Quiz"
                      >
                        <Trash2 size={22} />
                      </button>
                      <button
                        onClick={() => router.push(`/quiz/${quiz.id}`)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
                      >
                        View <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CustomPopup
        isOpen={deletePopup.isOpen}
        type="confirm"
        title="Delete Quiz?"
        message="Are you sure you want to permanently delete this quiz? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeletePopup({ isOpen: false, quizId: null })}
        onClose={() => setDeletePopup({ isOpen: false, quizId: null })}
      />

      <AuthenticatedNavbar />
    </div>
  );
}
