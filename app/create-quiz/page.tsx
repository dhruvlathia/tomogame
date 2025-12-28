"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AuthenticatedNavbar from "@/components/AuthenticatedNavbar";
import AuthenticatedTopbar from "@/components/AuthenticatedTopbar";
import { Question, Option } from "@/lib/dummy-data";
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
            // Verify if this draft belongs to the user (optional, but good practice if we stored userId)
            // For now, just load it
            setDraftId(currentDraft.id);
            setQuizType(currentDraft.type);
            setSelectedAnswers(currentDraft.answers);
            setCurrentQuestionIndex(currentDraft.currentQuestionIndex);
            setStep(currentDraft.step);
          } else {
            // Start new draft
            setDraftId(crypto.randomUUID());
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

    // Save to current
    localStorage.setItem("tomo_current_draft", JSON.stringify(draftData));

    // Save to drafts list
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
    // Remove answer if skipped
    const newAnswers = { ...selectedAnswers };
    delete newAnswers[questions[currentQuestionIndex].id];
    setSelectedAnswers(newAnswers);
    nextQuestion();
  };

  const handlePublish = async () => {
    if (!auth.currentUser) return;
    setPublishing(true);

    try {
      const quizData = {
        type: quizType,
        privacy,
        questions, // Save the questions snapshot with the quiz
        answers: selectedAnswers,
        createdAt: Date.now(),
        creatorId: auth.currentUser.uid,
      };

      // Save to Realtime DB
      await pushData(`qs/${auth.currentUser.uid}`, quizData);

      // Clear current draft
      localStorage.removeItem("tomo_current_draft");

      // Remove from drafts list
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
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white pb-24 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto p-6 relative z-10">
        <AuthenticatedTopbar />

        <div className="mt-4">
          {step === "type" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create Something New
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Choose what kind of interaction you want to create today.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => {
                    setQuizType("quiz");
                    setStep("questions");
                  }}
                  className="group relative bg-white dark:bg-slate-900/50 border-2 border-transparent hover:border-blue-500/50 rounded-3xl p-8 transition-all duration-300 shadow-xl shadow-blue-500/5 hover:shadow-blue-500/10 text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Layout size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                      <Sparkles
                        className="text-blue-600 dark:text-blue-400"
                        size={28}
                      />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">
                      Interactive Quiz
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Create a fun quiz about yourself. Friends will try to
                      guess your answers and see how well they know you!
                    </p>
                    <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-semibold gap-2">
                      Start Creating <ChevronRight size={18} />
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setQuizType("survey");
                    setStep("questions");
                  }}
                  className="group relative bg-white dark:bg-slate-900/50 border-2 border-transparent hover:border-purple-500/50 rounded-3xl p-8 transition-all duration-300 shadow-xl shadow-purple-500/5 hover:shadow-purple-500/10 text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BarChart3 size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                      <BarChart3
                        className="text-purple-600 dark:text-purple-400"
                        size={28}
                      />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Opinion Survey</h2>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Gather opinions and preferences from your friends. Perfect
                      for planning or just for fun!
                    </p>
                    <div className="mt-6 flex items-center text-purple-600 dark:text-purple-400 font-semibold gap-2">
                      Start Creating <ChevronRight size={18} />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === "questions" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <h2 className="text-xl font-bold mt-1">
                      Select your answer
                    </h2>
                  </div>
                  <button
                    onClick={skipQuestion}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    Skip <SkipForward size={16} />
                  </button>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              {currentQuestion && (
                <div className="bg-white dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl p-4 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                  <h3 className="text-2xl md:text-3xl font-bold text-center mb-10 leading-tight">
                    {currentQuestion.text}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    {currentQuestion.options.map((option) => {
                      const isSelected =
                        selectedAnswers[currentQuestion.id] === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() =>
                            handleOptionSelect(currentQuestion.id, option.id)
                          }
                          className={`group relative flex flex-col items-center p-2 md:p-3 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/20"
                              : "border-transparent bg-slate-50 dark:bg-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {option.imageSrc && (
                            <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-500">
                              <Image
                                src={option.imageSrc}
                                alt={option.name}
                                fill
                                className="object-cover"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                  <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg">
                                    <Check size={20} />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <span
                            className={`font-bold text-sm md:text-base ${
                              isSelected
                                ? "text-blue-600 dark:text-blue-400"
                                : ""
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
              <div className="flex justify-between items-center">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    currentQuestionIndex === 0
                      ? "opacity-0 pointer-events-none"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <ChevronLeft size={20} /> Previous
                </button>

                <button
                  onClick={nextQuestion}
                  className="flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                >
                  {currentQuestionIndex === questions.length - 1
                    ? "Finish"
                    : currentQuestion && selectedAnswers[currentQuestion.id]
                    ? "Next"
                    : "Skip"}{" "}
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === "summary" && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center">
              <div className="w-24 h-24 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check
                  className="text-green-600 dark:text-green-400"
                  size={48}
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-black">Quiz Ready!</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  You've answered {Object.keys(selectedAnswers).length} out of{" "}
                  {questions.length} questions. Ready to share this with your
                  friends?
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-3xl p-8 max-w-md mx-auto">
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500">Type</span>
                    <span className="font-bold capitalize">{quizType}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500">Questions</span>
                    <span className="font-bold">{questions.length}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500">Answered</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {Object.keys(selectedAnswers).length}
                    </span>
                  </div>

                  {/* Privacy Selection */}
                  <div className="pt-2">
                    <span className="text-slate-500 block mb-2">Privacy</span>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl">
                      <button
                        onClick={() => setPrivacy("public")}
                        className={`p-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                          privacy === "public"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        Public
                      </button>
                      <button
                        onClick={() => setPrivacy("private")}
                        className={`p-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                          privacy === "private"
                            ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        Private
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <button
                  onClick={() => setStep("questions")}
                  className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Review Answers
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
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
