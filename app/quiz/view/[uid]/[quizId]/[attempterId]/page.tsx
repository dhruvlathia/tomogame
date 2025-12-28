"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { readDataOnce } from "@/lib/realtime";
import { Question } from "@/lib/dummy-data";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import {
  ChevronLeft,
  Check,
  X,
  Loader2,
  AlertCircle,
  Trophy,
  Calendar,
  User,
} from "lucide-react";
import Image from "next/image";
import AuthenticatedNavbar from "@/components/AuthenticatedNavbar";
import AuthenticatedTopbar from "@/components/AuthenticatedTopbar";

interface QuizData {
  type: "quiz" | "survey";
  privacy: "public" | "private";
  questions: Question[];
  answers: Record<string, string>;
  createdAt: number;
  creatorId: string;
}

interface AttemptData {
  attempterName: string;
  attempterUid: string;
  answers: Record<string, string>;
  timestamp: number;
  quizType: string;
}

export default function ViewAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;
  const quizId = params.quizId as string;
  const attempterId = params.attempterId as string;

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizData, attemptData] = await Promise.all([
          readDataOnce(`qs/${uid}/${quizId}`),
          readDataOnce(`aqs/${uid}/${quizId}/${attempterId}`),
        ]);

        if (quizData && attemptData) {
          setQuiz(quizData as QuizData);
          setAttempt(attemptData as AttemptData);
        } else {
          setError("Data not found.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    if (uid && quizId && attempterId) {
      fetchData();
    }
  }, [uid, quizId, attempterId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quiz || !attempt) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-white/10 max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="text-red-500 w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold">Oops!</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {error || "Something went wrong."}
          </p>
          <button
            onClick={() => router.back()}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const calculateScore = () => {
    if (!quiz.answers || !attempt.answers) return 0;
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (attempt.answers[q.id] === quiz.answers[q.id]) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const score = calculateScore();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-white flex flex-col relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="grow relative z-10 p-4 md:p-8 mb-24">
        <div className="max-w-4xl mx-auto">
          <AuthenticatedTopbar />
        </div>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-4xl p-8 md:p-12 shadow-2xl shadow-slate-200/40 dark:shadow-none animate-in fade-in slide-in-from-top-8 duration-700">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors mb-8 font-bold cursor-pointer"
            >
              <ChevronLeft size={20} /> Back to My Quizzes
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    <User
                      className="text-blue-600 dark:text-blue-400"
                      size={24}
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tight">
                      {attempt.attempterName}&apos;s Results
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(attempt.timestamp).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-md text-xs font-bold uppercase">
                        {quiz.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-950/40 p-6 rounded-4xl border border-slate-200/60 dark:border-white/5">
                <div className="text-center">
                  <div
                    className={`text-4xl font-black ${
                      score >= 70
                        ? "text-green-500"
                        : score >= 40
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {score}%
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Final Score
                  </div>
                </div>
                <div className="w-px h-12 bg-slate-200 dark:bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {Object.keys(attempt.answers).length}/
                    {quiz.questions.length}
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Answered
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {quiz.questions.map((question, qIdx) => {
              const selectedOptionId = attempt.answers[question.id];
              const correctOptionId = quiz.answers[question.id];
              const isCorrect = selectedOptionId === correctOptionId;

              return (
                <div
                  key={question.id}
                  className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-4xl p-6 md:p-10 shadow-xl shadow-slate-200/30 dark:shadow-none animate-in fade-in slide-in-from-bottom-8 duration-700"
                  style={{ animationDelay: `${qIdx * 0.1}s` }}
                >
                  <div className="flex items-start gap-6">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-400 shrink-0">
                      {qIdx + 1}
                    </div>
                    <div className="space-y-8 w-full">
                      <h3 className="text-xl md:text-2xl font-bold leading-tight">
                        {question.text}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.options.map((option) => {
                          const isSelected = selectedOptionId === option.id;
                          const isCorrectOption = correctOptionId === option.id;

                          let borderClass =
                            "border-transparent bg-slate-50 dark:bg-slate-950/40";
                          let icon = null;

                          if (isCorrectOption) {
                            borderClass =
                              "border-green-500 bg-green-50 dark:bg-green-500/10";
                            icon = (
                              <Check
                                className="text-green-600 dark:text-green-400"
                                size={20}
                                strokeWidth={3}
                              />
                            );
                          } else if (isSelected && !isCorrect) {
                            borderClass =
                              "border-red-500 bg-red-50 dark:bg-red-500/10";
                            icon = (
                              <X
                                className="text-red-600 dark:text-red-400"
                                size={20}
                                strokeWidth={3}
                              />
                            );
                          }

                          return (
                            <div
                              key={option.id}
                              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${borderClass}`}
                            >
                              {option.imageSrc && (
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                                  <Image
                                    src={option.imageSrc}
                                    alt={option.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <span
                                className={`flex-grow font-bold ${
                                  isCorrectOption
                                    ? "text-green-700 dark:text-green-400"
                                    : isSelected && !isCorrect
                                    ? "text-red-700 dark:text-red-400"
                                    : "text-slate-600 dark:text-slate-300"
                                }`}
                              >
                                {option.name}
                              </span>
                              {icon}
                            </div>
                          );
                        })}
                      </div>

                      {!isCorrect && selectedOptionId && (
                        <div className="flex items-center gap-2 text-sm font-bold text-red-500 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                          <AlertCircle size={16} />
                          Incorrect. The correct answer was highlighted in
                          green.
                        </div>
                      )}
                      {isCorrect && (
                        <div className="flex items-center gap-2 text-sm font-bold text-green-500 bg-green-500/5 p-3 rounded-xl border border-green-500/10">
                          <Check size={16} />
                          Correct! Well done.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <AuthenticatedNavbar />
    </div>
  );
}
