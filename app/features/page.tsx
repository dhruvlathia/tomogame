"use client";

import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import {
  Zap,
  Shield,
  Share2,
  Trophy,
  Clock,
  Layout,
  Smartphone,
  Users,
} from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Quiz Creation",
      description:
        "Create engaging quizzes in minutes with our intuitive builder. No complex setup required.",
      color: "blue",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description:
        "Control who sees your quizzes with public and private visibility settings.",
      color: "purple",
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Seamless Sharing",
      description:
        "Share your unique quiz link across any platform with native sharing support.",
      color: "pink",
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Live Leaderboards",
      description:
        "Watch your friends compete in real-time and see who knows you best.",
      color: "orange",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Draft System",
      description:
        "Never lose your progress. Our auto-save system keeps your drafts safe until you're ready to publish.",
      color: "green",
    },
    {
      icon: <Layout className="w-6 h-6" />,
      title: "Beautiful Themes",
      description:
        "Choose from a variety of stunning themes to make your quiz truly yours.",
      color: "indigo",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Optimized",
      description:
        "A premium experience on every device. Play and create on the go.",
      color: "red",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Driven",
      description:
        "Join thousands of users making friendships stronger through fun trivia.",
      color: "teal",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
            Powerful Features for <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
              Ultimate Fun
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Discover all the tools we've built to help you create, share, and
            enjoy the best friendship quizzes on the web.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-[2rem] hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-24 p-12 bg-linear-to-br from-blue-600 to-purple-700 rounded-[3rem] text-center text-white shadow-2xl shadow-blue-500/20">
          <h2 className="text-3xl font-black mb-4">Ready to get started?</h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto text-sm">
            Join thousands of users and start creating your first quiz today.
            It's free, fun, and takes less than a minute!
          </p>
          <a
            href="/"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Create Your Quiz Now
          </a>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
