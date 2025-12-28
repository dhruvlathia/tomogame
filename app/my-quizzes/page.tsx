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
  LayoutGrid,
  Share2,
  Eye,
} from "lucide-react";
import CustomPopup from "@/components/CustomPopup";
import SharePopup from "@/components/SharePopup";

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
  const [attempts, setAttempts] = useState<Record<string, any>>({});

  // 1. State for Deletion
  const [deletePopup, setDeletePopup] = useState<{
    isOpen: boolean;
    quizId: string | null;
  }>({
    isOpen: false,
    quizId: null,
  });

  // 2. State for Sharing (New)
  const [shareConfig, setShareConfig] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
  }>({
    isOpen: false,
    url: "",
    title: "",
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      } else {
        const unsubscribeQuizzes = listenData(`qs/${user.uid}`, (data) => {
          if (data) {
            const quizList = Object.entries(data).map(
              ([id, value]: [string, any]) => ({
                id,
                ...value,
              })
            );
            quizList.sort((a, b) => b.createdAt - a.createdAt);
            setQuizzes(quizList);
          } else {
            setQuizzes([]);
          }
          setLoading(false);
        });

        const unsubscribeAttempts = listenData(`aqs/${user.uid}`, (data) => {
          if (data) {
            setAttempts(data);
          } else {
            setAttempts({});
          }
        });

        return () => {
          unsubscribeQuizzes();
          unsubscribeAttempts();
        };
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const calculateScore = (quiz: PublishedQuiz, attempt: any) => {
    if (!quiz.answers || !attempt.answers) return 0;
    let correct = 0;
    const total = quiz.questions.length;

    quiz.questions.forEach((q) => {
      if (attempt.answers[q.id] === quiz.answers[q.id]) {
        correct++;
      }
    });

    return Math.round((correct / total) * 100);
  };

  const handleDeleteClick = (quizId: string) => {
    setDeletePopup({ isOpen: true, quizId });
  };

  // 3. Handler to open the dynamic Share Popup
  const handleShareClick = (quiz: PublishedQuiz) => {
    if (!auth.currentUser) return;

    const url = `${window.location.origin}/quiz/${auth.currentUser.uid}/${quiz.id}`;
    const title =
      quiz.type === "quiz"
        ? "Check out my personality quiz!"
        : "Please fill out my survey!";

    setShareConfig({
      isOpen: true,
      url,
      title,
    });
  };

  const confirmDelete = async () => {
    if (deletePopup.quizId && auth.currentUser) {
      try {
        await deleteData(`qs/${auth.currentUser.uid}/${deletePopup.quizId}`);
        await deleteData(`aqs/${auth.currentUser.uid}/${deletePopup.quizId}`);
        setDeletePopup({ isOpen: false, quizId: null });
      } catch (error) {
        console.error("Error deleting quiz:", error);
        alert("Failed to delete quiz. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto p-4 md:p-8 mb-24 relative z-10">
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
              {quizzes.map((quiz) => {
                const quizAttempts = attempts[quiz.id]
                  ? Object.values(attempts[quiz.id])
                  : [];

                return (
                  <div
                    key={quiz.id}
                    className="group relative bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/20 rounded-4xl p-4 md:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/40"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                          {/* 4. Use standard button here to trigger state update */}
                          <button
                            onClick={() => handleShareClick(quiz)}
                            className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl transition-all cursor-pointer"
                            title="Share Quiz"
                          >
                            <Share2 size={22} />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(quiz.id)}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all cursor-pointer"
                            title="Delete Quiz"
                          >
                            <Trash2 size={22} />
                          </button>
                        </div>
                      </div>

                      {/* Attempters List */}
                      {quizAttempts.length > 0 && (
                        <div className="pt-4 border-t border-slate-100 dark:border-white/20">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                              Recent Attempts ({quizAttempts.length})
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {quizAttempts.map((attempt: any, idx: number) => {
                              const score = calculateScore(quiz, attempt);
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-4 bg-gray-200/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-white/20 shadow-sm dark:shadow-none"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                                      {attempt.attempterName
                                        ?.charAt(0)
                                        .toUpperCase() || "A"}
                                    </div>
                                    <span className="font-bold text-sm truncate max-w-[120px]">
                                      {attempt.attempterName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() =>
                                        router.push(
                                          `/quiz/view/${auth.currentUser?.uid}/${quiz.id}/${attempt.attempterUid}`
                                        )
                                      }
                                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all cursor-pointer"
                                      title="View Detailed Answers"
                                    >
                                      <Eye size={18} />
                                    </button>
                                    <div className="flex items-center gap-2">
                                      <div className="h-1.5 w-12 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            score >= 70
                                              ? "bg-green-500"
                                              : score >= 40
                                              ? "bg-yellow-500"
                                              : "bg-red-500"
                                          }`}
                                          style={{ width: `${score}%` }}
                                        />
                                      </div>
                                      <span
                                        className={`text-xs font-black ${
                                          score >= 70
                                            ? "text-green-500"
                                            : score >= 40
                                            ? "text-yellow-500"
                                            : "text-red-500"
                                        }`}
                                      >
                                        {score}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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

      {/* 5. Single SharePopup instance that receives state */}
      <SharePopup
        url={shareConfig.url}
        title={shareConfig.title}
        isOpen={shareConfig.isOpen}
        onClose={() => setShareConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      <AuthenticatedNavbar />
    </div>
  );
}
