"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { readDataOnce, writeData } from "@/lib/realtime";
import { Question, Option } from "@/lib/dummy-data";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { db } from "@/lib/firebase";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  SkipForward,
  Loader2,
  AlertCircle,
  Trophy,
  Share2,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";

interface QuizData {
  type: "quiz" | "survey";
  privacy: "public" | "private";
  questions: Question[];
  createdAt: number;
  creatorId: string;
}

export default function AttemptQuizPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;
  const quizId = params.quizId as string;

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [step, setStep] = useState<
    "auth" | "intro" | "questions" | "completed" | "already-attempted"
  >("auth");
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [attempterName, setAttempterName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile Check State
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [genderLoading, setGenderLoading] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAttempterName(currentUser.email?.split("@")[0] || "");
        // Check if user has a profile before proceeding
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          checkExistingAttempt(currentUser.uid);
        } else {
          setPendingUser(currentUser);
          setShowGenderModal(true);
        }
      } else {
        setStep("auth");
      }
    });
    return () => unsubscribe();
  }, [uid, quizId]);

  const checkExistingAttempt = async (attempterUid: string) => {
    try {
      const existingAttempt = await readDataOnce(
        `aqs/${uid}/${quizId}/${attempterUid}`
      );
      if (existingAttempt) {
        setStep("already-attempted");
      } else {
        setStep("intro");
      }
    } catch (err) {
      console.error("Error checking attempt:", err);
    }
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await readDataOnce(`qs/${uid}/${quizId}`);
        if (data) {
          setQuiz(data as QuizData);
        } else {
          setError("Quiz not found.");
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    if (uid && quizId) {
      fetchQuiz();
    }
  }, [uid, quizId]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setAuthError("Please fill in all fields");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    const email = `${username.trim()}@tomogame.local`;

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the profile check
    } catch (err: any) {
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        try {
          const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          // onAuthStateChanged will handle the profile check
        } catch (regErr: any) {
          setAuthError(regErr.message);
        }
      } else {
        setAuthError(err.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGenderSelect = async (gender: "Male" | "Female") => {
    if (!pendingUser) return;

    setGenderLoading(true);
    try {
      const userRef = ref(db, `users/${pendingUser.uid}`);
      await set(userRef, {
        username: username || pendingUser.email?.split("@")[0],
        email: pendingUser.email,
        gender: gender,
        createdAt: new Date().toISOString(),
        uid: pendingUser.uid,
      });
      setShowGenderModal(false);
      checkExistingAttempt(pendingUser.uid);
    } catch (err) {
      console.error("Error saving gender:", err);
      setAuthError("Failed to save profile. Please try again.");
      setShowGenderModal(false);
    } finally {
      setGenderLoading(false);
    }
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));

    // Auto-advance after a short delay for better UX
    setTimeout(() => {
      nextQuestion();
    }, 400);
  };

  const nextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;
    setSubmitting(true);

    try {
      const attemptData = {
        attempterName:
          attempterName || user.email?.split("@")[0] || "Anonymous",
        attempterUid: user.uid,
        answers: selectedAnswers,
        questions: quiz.questions, // Include questions as requested
        timestamp: Date.now(),
        quizType: quiz.type,
      };

      // Save to Realtime DB under 'aqs' with user UID as key to prevent retakes
      await writeData(`aqs/${uid}/${quizId}/${user.uid}`, attemptData);
      setStep("completed");
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">
            Loading quiz...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
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
            onClick={() => router.push("/")}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex flex-col relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <PublicNavbar />

      <main className="flex-grow relative z-10 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-4xl w-full">
          {step === "auth" && (
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-md mx-auto">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto">
                  <span className="text-4xl">👋</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight">
                  Welcome to{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    TomoGame
                  </span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Enter a username and password to start the quiz. New accounts
                  are created automatically.
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. best_friend_01"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    disabled={authLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all pr-12"
                      disabled={authLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm animate-shake">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {authLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Continue to Quiz</span>
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === "intro" && (
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto rotate-3 group-hover:rotate-6 transition-transform">
                  <Trophy className="text-blue-600 dark:text-blue-400 w-10 h-10" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                  Ready to{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    Attempt
                  </span>
                  ?
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">
                  You are logged in as{" "}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {attempterName}
                  </span>
                  . Ready to start the quiz?
                </p>
              </div>

              <div className="max-w-sm mx-auto">
                <button
                  onClick={() => setStep("questions")}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xl shadow-xl shadow-blue-600/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          )}

          {step === "already-attempted" && (
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 text-center">
              <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto">
                <Check className="text-purple-600 dark:text-purple-400 w-10 h-10" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                Already{" "}
                <span className="text-purple-600 dark:text-purple-400">
                  Attempted
                </span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">
                Hey {attempterName}, you have already submitted your answers for
                this quiz. You can only attempt it once!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <button
                  onClick={() => router.push("/")}
                  className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
                >
                  Go Home
                </button>
                <button
                  onClick={() => router.push("/home")}
                  className="px-10 py-5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-2xl font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  My Dashboard
                </button>
              </div>
            </div>
          )}

          {step === "questions" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              {/* Progress Header */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                      Question {currentQuestionIndex + 1} of{" "}
                      {quiz.questions.length}
                    </span>
                    <h2 className="text-2xl font-bold mt-1">
                      Pick your answer
                    </h2>
                  </div>
                  <div className="text-sm font-bold text-slate-400">
                    {Math.round(progress)}% Complete
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-1">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-16 shadow-2xl relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                <h3 className="text-2xl md:text-4xl font-black text-center mb-12 leading-tight">
                  {currentQuestion.text}
                </h3>

                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  {currentQuestion.options.map((option) => {
                    const isSelected =
                      selectedAnswers[currentQuestion.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() =>
                          handleOptionSelect(currentQuestion.id, option.id)
                        }
                        className={`group relative flex flex-col items-center p-3 md:p-4 rounded-[2rem] border-4 transition-all duration-500 cursor-pointer ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 scale-[1.02]"
                            : "border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-[1.02]"
                        }`}
                      >
                        {option.imageSrc && (
                          <div className="relative w-full aspect-square mb-6 rounded-3xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500">
                            <Image
                              src={option.imageSrc}
                              alt={option.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-[2px] flex items-center justify-center">
                                <div className="bg-blue-500 text-white p-3 rounded-full shadow-2xl scale-110 animate-in zoom-in duration-300">
                                  <Check size={24} strokeWidth={3} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <span
                          className={`font-black text-base md:text-xl tracking-tight ${
                            isSelected
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {option.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all cursor-pointer ${
                    currentQuestionIndex === 0
                      ? "opacity-0 pointer-events-none"
                      : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <ChevronLeft size={24} /> Back
                </button>

                <div className="flex items-center gap-4">
                  <button
                    onClick={nextQuestion}
                    className="flex items-center gap-3 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-white/10 cursor-pointer"
                  >
                    {currentQuestionIndex === quiz.questions.length - 1
                      ? submitting
                        ? "Submitting..."
                        : "Finish"
                      : "Next"}
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "completed" && (
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[3rem] p-12 md:p-20 shadow-2xl text-center space-y-10 animate-in zoom-in-95 duration-700">
              <div className="relative">
                <div className="w-32 h-32 bg-green-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto animate-bounce">
                  <Check
                    className="text-green-600 dark:text-green-400 w-16 h-16"
                    strokeWidth={3}
                  />
                </div>
                {/* Confetti-like elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                  <div
                    className="absolute top-0 left-0 w-2 h-2 bg-blue-500 rounded-full animate-ping"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="absolute top-10 right-0 w-2 h-2 bg-purple-500 rounded-full animate-ping"
                    style={{ animationDelay: "0.3s" }}
                  />
                  <div
                    className="absolute bottom-0 left-10 w-2 h-2 bg-pink-500 rounded-full animate-ping"
                    style={{ animationDelay: "0.5s" }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                  {quiz.type === "quiz" ? "Quiz" : "Survey"}{" "}
                  <span className="text-green-600 dark:text-green-400">
                    Submitted!
                  </span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xl max-w-md mx-auto leading-relaxed">
                  Great job,{" "}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {attempterName}
                  </span>
                  ! Your answers have been sent. The creator will be able to see
                  how you did.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <button
                  onClick={() => router.push("/")}
                  className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
                >
                  Create Your Own Quiz
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "TomoGame Quiz",
                        text: "I just attempted a quiz on TomoGame! Check it out.",
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied to clipboard!");
                    }
                  }}
                  className="px-10 py-5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-2xl font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Share2 size={24} /> Share Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <PublicFooter />

      {/* Gender Selection Modal */}
      {showGenderModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all duration-500 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 pb-4 text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 group-hover:rotate-6 transition-transform">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                One Last Step!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                To personalize your experience, please select your gender.
              </p>
            </div>

            {/* Selection Area */}
            <div className="p-8 pt-4 grid grid-cols-2 gap-4">
              <button
                onClick={() => handleGenderSelect("Male")}
                disabled={genderLoading}
                className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  👨
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Male
                </span>
                {genderLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-2xl">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>

              <button
                onClick={() => handleGenderSelect("Female")}
                disabled={genderLoading}
                className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent hover:border-pink-500/50 hover:bg-pink-50/50 dark:hover:bg-pink-900/20 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  👩
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Female
                </span>
                {genderLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-2xl">
                    <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            </div>

            {/* Footer Info */}
            <div className="px-8 pb-8 text-center">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                This helps us customize your avatar and quiz themes
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoomIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-in {
          animation-duration: 300ms;
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fadeIn;
        }
        .zoom-in-95 {
          animation-name: zoomIn;
        }
      `}</style>
    </div>
  );
}
