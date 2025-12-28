"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AuthenticatedNavbar from "@/components/AuthenticatedNavbar";
import AuthenticatedTopbar from "@/components/AuthenticatedTopbar";
import { Question } from "@/lib/dummy-data";
import { readDataOnce, pushData } from "@/lib/realtime";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  SkipForward,
  Sparkles,
  Layout,
  BarChart3,
} from "lucide-react";
import Image from "next/image";

// Helper to generate ID (safer than crypto.randomUUID for client compatibility)
const generateId = () => Math.random().toString(36).substring(2, 15);

export default function CreateQuizPage() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState<"type" | "questions" | "summary">("type");
  const [quizType, setQuizType] = useState<"quiz" | "survey">("quiz");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [draftId, setDraftId] = useState<string>("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [publishing, setPublishing] = useState(false);
  const router = useRouter();

  // Load questions and draft
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
      } else {
        try {
          // 1. Fetch Questions
          const data = await readDataOnce("default/quiz");
          if (data) {
            const questionsList = Array.isArray(data)
              ? data
              : Object.values(data);
            setQuestions(questionsList as Question[]);
          }

          // 2. Load Draft
          const currentDraftJson = localStorage.getItem("tomo_current_draft");
          if (currentDraftJson) {
            const currentDraft = JSON.parse(currentDraftJson);
            setDraftId(currentDraft.id);
            setQuizType(currentDraft.type);
            setSelectedAnswers(currentDraft.answers);
            setCurrentQuestionIndex(currentDraft.currentQuestionIndex);
            setStep(currentDraft.step);
          } else {
            // Start new draft
            setDraftId(generateId());
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Auto-save draft
  useEffect(() => {
    if (!draftId || loading) return;

    const draftData = {
      id: draftId,
      type: quizType,
      answers: selectedAnswers,
      currentQuestionIndex,
      step,
      lastUpdated: Date.now(),
    };

    if (Object.keys(selectedAnswers).length > 0) {
      localStorage.setItem("tomo_current_draft", JSON.stringify(draftData));
    }

    const draftsJson = localStorage.getItem("tomo_quiz_drafts");
    const drafts = draftsJson ? JSON.parse(draftsJson) : {};
    drafts[draftId] = draftData;
    localStorage.setItem("tomo_quiz_drafts", JSON.stringify(drafts));
  }, [draftId, quizType, selectedAnswers, currentQuestionIndex, step, loading]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));

    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStep("summary");
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const skipQuestion = () => {
    if (questions.length === 0) return;
    const newAnswers = { ...selectedAnswers };
    delete newAnswers[questions[currentQuestionIndex].id];
    setSelectedAnswers(newAnswers);
    nextQuestion();
  };

  const handlePublish = async () => {
    if (!auth.currentUser) return;

    const answeredQuestionIds = Object.keys(selectedAnswers);
    if (answeredQuestionIds.length < 7) {
      alert("Please answer at least 7 questions to publish your quiz.");
      return;
    }

    setPublishing(true);

    try {
      const filteredQuestions = questions.filter((q) =>
        answeredQuestionIds.includes(q.id)
      );

      const quizData = {
        type: quizType,
        privacy,
        questions: filteredQuestions,
        answers: selectedAnswers,
        createdAt: Date.now(),
        creatorId: auth.currentUser.uid,
      };

      await pushData(`qs/${auth.currentUser.uid}`, quizData);

      localStorage.removeItem("tomo_current_draft");

      const draftsJson = localStorage.getItem("tomo_quiz_drafts");
      if (draftsJson) {
        const drafts = JSON.parse(draftsJson);
        delete drafts[draftId];
        localStorage.setItem("tomo_quiz_drafts", JSON.stringify(drafts));
      }

      router.push("/home");
    } catch (error) {
      console.error("Error publishing quiz:", error);
      alert("Failed to publish quiz. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-200 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  return (
    // Background updated to slate-200 (Light) and slate-950 (Dark) for contrast
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-slate-200 pb-24 relative overflow-hidden transition-colors duration-300">
      {/* Background Blobs - Reduced opacity for subtle effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-5 mix-blend-overlay pointer-events-none"></div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 relative z-10">
        <AuthenticatedTopbar />

        <div className="mt-8">
          {step === "type" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center space-y-3">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">
                  Create Something New
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  Choose what kind of interaction you want to create today.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => {
                    setQuizType("quiz");
                    setStep("questions");
                  }}
                  // Card updated: bg-white for light mode contrast
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-3xl p-8 transition-all duration-300 shadow-xl shadow-slate-300/50 dark:shadow-none hover:-translate-y-1 text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Layout size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                      <Sparkles
                        className="text-blue-600 dark:text-blue-400"
                        size={32}
                      />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                      Interactive Quiz
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                      Create a fun quiz about yourself. Friends will try to
                      guess your answers and see how well they know you!
                    </p>
                    <div className="mt-8 flex items-center text-blue-600 dark:text-blue-400 font-bold gap-2 text-sm uppercase tracking-wide">
                      Start Creating <ChevronRight size={16} />
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setQuizType("survey");
                    setStep("questions");
                  }}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 rounded-3xl p-8 transition-all duration-300 shadow-xl shadow-slate-300/50 dark:shadow-none hover:-translate-y-1 text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BarChart3 size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                      <BarChart3
                        className="text-purple-600 dark:text-purple-400"
                        size={32}
                      />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                      Opinion Survey
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                      Gather opinions and preferences from your friends. Perfect
                      for planning or just for fun!
                    </p>
                    <div className="mt-8 flex items-center text-purple-600 dark:text-purple-400 font-bold gap-2 text-sm uppercase tracking-wide">
                      Start Creating <ChevronRight size={16} />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === "questions" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Progress Bar */}
              <div className="space-y-3 px-1">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <h2 className="text-lg font-bold mt-1 text-slate-900 dark:text-white">
                      Select your answer
                    </h2>
                  </div>
                  <button
                    onClick={skipQuestion}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    Skip <SkipForward size={14} />
                  </button>
                </div>
                <div className="h-2.5 w-full bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              {currentQuestion && (
                // Card updated: bg-white, distinct borders
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-300/50 dark:shadow-none">
                  <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 leading-tight text-slate-900 dark:text-white">
                    {currentQuestion.text}
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected =
                        selectedAnswers[currentQuestion.id] === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() =>
                            handleOptionSelect(currentQuestion.id, option.id)
                          }
                          // Options updated: Better contrast for selected/unselected states
                          className={`group relative flex flex-col items-center p-3 md:p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-lg shadow-blue-500/10 scale-[1.02]"
                              : "border-transparent bg-slate-100 dark:bg-slate-950/50 hover:bg-slate-200 dark:hover:bg-slate-800 hover:scale-[1.01]"
                          }`}
                        >
                          {option.imageSrc && (
                            <div className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                              <Image
                                src={option.imageSrc}
                                alt={option.name}
                                fill
                                className="object-cover"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-200">
                                  <div className="bg-blue-500 text-white p-1.5 rounded-full shadow-lg">
                                    <Check size={20} strokeWidth={3} />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <span
                            className={`font-bold text-sm md:text-base text-center leading-tight ${
                              isSelected
                                ? "text-blue-700 dark:text-blue-400"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {option.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    currentQuestionIndex === 0
                      ? "opacity-0 pointer-events-none"
                      : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md"
                  }`}
                >
                  <ChevronLeft size={18} /> Previous
                </button>

                <button
                  onClick={nextQuestion}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  {currentQuestionIndex === questions.length - 1
                    ? "Finish"
                    : currentQuestion && selectedAnswers[currentQuestion.id]
                    ? "Next"
                    : "Skip"}{" "}
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === "summary" && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center">
              <div className="w-20 h-20 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-500/5">
                <Check
                  className="text-green-600 dark:text-green-400"
                  size={40}
                  strokeWidth={3}
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                  {Object.keys(selectedAnswers).length >= 7
                    ? "Quiz Ready!"
                    : "Almost There!"}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-base">
                  {Object.keys(selectedAnswers).length >= 7
                    ? `You've answered ${
                        Object.keys(selectedAnswers).length
                      } questions. Ready to share this with your friends?`
                    : `You've answered ${
                        Object.keys(selectedAnswers).length
                      } questions. You need at least 7 answered questions to publish.`}
                </p>
              </div>

              {/* Summary Card updated to bg-white */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md mx-auto shadow-xl shadow-slate-300/50 dark:shadow-none text-sm">
                <div className="space-y-5 text-left">
                  <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium">Type</span>
                    <span className="font-bold capitalize bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-700 dark:text-slate-300">
                      {quizType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium">
                      Questions
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {questions.length} Total
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium">Answered</span>
                    <span
                      className={`font-bold flex items-center gap-2 ${
                        Object.keys(selectedAnswers).length >= 7
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {Object.keys(selectedAnswers).length} / 7 min
                      {Object.keys(selectedAnswers).length >= 7 && (
                        <Check size={14} strokeWidth={3} />
                      )}
                    </span>
                  </div>

                  {/* Privacy Selection */}
                  <div className="pt-2">
                    <span className="text-slate-500 font-medium block mb-3">
                      Privacy Setting
                    </span>
                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-xl">
                      <button
                        onClick={() => setPrivacy("public")}
                        className={`p-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          privacy === "public"
                            ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        Public
                      </button>
                      <button
                        onClick={() => setPrivacy("private")}
                        className={`p-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          privacy === "private"
                            ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        Private
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={() => setStep("questions")}
                  className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Review Answers
                </button>
                <button
                  onClick={handlePublish}
                  disabled={
                    publishing || Object.keys(selectedAnswers).length < 7
                  }
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {publishing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Save & Publish"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* <AuthenticatedNavbar /> */}
    </div>
  );
}
