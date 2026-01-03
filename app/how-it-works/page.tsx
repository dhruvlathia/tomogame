"use client";

import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import {
  UserPlus,
  PenTool,
  Share2,
  BarChart3,
  ChevronRight,
} from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <UserPlus className="w-8 h-8" />,
      title: "Create Your Profile",
      description:
        "Sign up in seconds with just a username and password. No email verification required to get started.",
      color: "blue",
    },
    {
      icon: <PenTool className="w-8 h-8" />,
      title: "Craft Your Questions",
      description:
        "Use our intuitive builder to create fun questions about yourself. Add images to make it more engaging!",
      color: "purple",
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "Share the Link",
      description:
        "Send your unique quiz link to your friends via WhatsApp, Facebook, or any other platform.",
      color: "pink",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "See the Results",
      description:
        "Track who attempted your quiz and see their scores. Discover who really knows you best!",
      color: "indigo",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <PublicNavbar />

      <main className="max-w-5xl mx-auto px-6 pt-12 pb-24">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
            How it{" "}
            <span className="text-blue-600 dark:text-blue-400">Works</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Getting started with TomoGame is easy. Follow these four simple
            steps to start challenging your friends.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-[3rem] hover:scale-[1.01] transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="shrink-0 w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white shadow-inner">
                {step.icon}
              </div>

              <div className="grow text-center md:text-left space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                  Step {index + 1}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -bottom-6 left-1/2 -translate-x-1/2 text-slate-200 dark:text-slate-800">
                  <ChevronRight className="w-12 h-12 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Video Placeholder / Visual Aid */}
        <div className="mt-24 aspect-video bg-slate-200 dark:bg-slate-900 rounded-[3rem] flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-600/10 group-hover:opacity-50 transition-opacity" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform cursor-pointer">
              <div className="w-0 h-0 border-t-12 border-t-transparent border-l-20 border-l-blue-600 border-b-12 border-b-transparent ml-2" />
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Watch Tutorial
            </span>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
