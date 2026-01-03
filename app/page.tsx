"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [genderLoading, setGenderLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    const email = `${username.trim()}@tomogame.local`;

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await checkUserInDatabase(result.user);
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
          await checkUserInDatabase(result.user);
        } catch (regErr: any) {
          if (regErr.code === "auth/email-already-in-use") {
            setError("Incorrect password for this username.");
          } else {
            setError(getFriendlyErrorMessage(regErr.code));
          }
        }
      } else {
        setError(getFriendlyErrorMessage(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const checkUserInDatabase = async (authUser: User) => {
    try {
      const userRef = ref(db, `users/${authUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        router.push("/home");
      } else {
        setPendingUser(authUser);
        setShowGenderModal(true);
      }
    } catch (err) {
      console.error("Error checking user:", err);
      router.push("/home");
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
      router.push("/home");
    } catch (err) {
      console.error("Error saving gender:", err);
      setError("Failed to save profile. Please try again.");
      setShowGenderModal(false);
    } finally {
      setGenderLoading(false);
    }
  };

  const getFriendlyErrorMessage = (code: string) => {
    switch (code) {
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/invalid-email":
        return "Invalid username format.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  if (!isMounted) return null;

  return (
    // UPDATED: bg-slate-200 provides much stronger contrast against white cards than slate-100
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-blue-500/30 font-sans overflow-x-hidden flex flex-col transition-colors duration-300">
      {/* Background Elements */}
      <div className="fixed inset-0 h-screen z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 dark:bg-blue-600/10 blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/5 dark:bg-purple-600/10 blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-10 mix-blend-overlay"></div>
      </div>

      <PublicNavbar />

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-20 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center flex-grow">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-[10px] font-bold tracking-wider uppercase shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Join the Fun
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
            The Ultimate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
              Friendship Quiz
            </span>
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
            Create quizzes about yourself, share them with friends, and discover
            who knows you best. Build stronger bonds through fun trivia!
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold overflow-hidden shadow-sm"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                    alt="avatar"
                  />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                +2k
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Friendships Made
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                Connecting friends everywhere
              </div>
            </div>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

          {/* Card is strictly bg-white. With body being bg-slate-200, this will now pop. */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-300/50 dark:shadow-none">
            {user ? (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-blue-400">👋</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Welcome back!
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You are logged in as{" "}
                  <span className="text-blue-600 dark:text-blue-400 font-mono font-medium">
                    {user.email?.split("@")[0]}
                  </span>
                </p>
                <button
                  onClick={() => checkUserInDatabase(user)}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    Start Your Quiz
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Enter a username to create your profile.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. best_friend_01"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      // UPDATED: bg-slate-100 for input creates contrast against bg-white card
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        // UPDATED: bg-slate-100 for input
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all pr-10"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-500/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-xs font-medium animate-shake">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Get Started</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    By entering, you agree to our{" "}
                    <a
                      href="#"
                      className="text-slate-600 dark:text-slate-400 hover:underline"
                    >
                      Terms of Service
                    </a>
                    . Accounts created automatically.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-300 dark:border-slate-800/50">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Create Your Quiz
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Easily craft questions about your likes, dislikes, and memories.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Share & Compare
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Send your unique quiz link to friends and see who gets the highest
              score.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-800 rounded-xl flex items-center justify-center text-pink-600 dark:text-pink-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Track Results
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              View detailed scoreboards and see which questions stumped them.
            </p>
          </div>
        </div>
      </section>

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
