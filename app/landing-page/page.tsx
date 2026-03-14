"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FiArrowRight,
  FiCheckCircle,
  FiTrendingUp,
  FiGrid,
  FiUsers,
} from "react-icons/fi";
import { useBoards } from "../_context/BoardContext";

const features = [
  {
    icon: FiGrid,
    title: "Task Management",
    description:
      "Create, organize, and prioritize tasks across drag-and-drop boards.",
  },
  {
    icon: FiUsers,
    title: "Team Collaboration",
    description: "Share boards and work with your team in real time.",
  },
  {
    icon: FiTrendingUp,
    title: "Progress Tracking",
    description: "Visual progress bars keep every list and board at a glance.",
  },
  {
    icon: FiCheckCircle,
    title: "Completion Tracking",
    description: "Mark tasks done and watch your completion rate climb.",
  },
];

export default function Home() {
  const router = useRouter();
  const { user } = useBoards();

  function handleGetStarted() {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push("/dashboard/board");
  }

  return (
    <main className="bg-slate-950 min-h-screen flex flex-col">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-5 pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Simple · Fast · Focused
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-100 leading-[1.1] tracking-tight max-w-3xl mb-5">
          Organize your work <span className="text-blue-400">effortlessly</span>
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-xl leading-relaxed mb-10">
          TaskFlow gives your team a clear, shared view of who's doing what and
          when — so nothing slips through the cracks.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleGetStarted}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
          >
            Get started free
            <FiArrowRight size={15} />
          </button>
          {!user && (
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 hover:border-slate-600 rounded-xl transition-all"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Subtle social proof */}
        <p className="mt-8 text-xs text-slate-600">
          No credit card required · Free to use
        </p>
      </section>

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <div className="border-t border-slate-800 mx-5 md:mx-16" />

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section className="px-5 md:px-16 py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">
            Everything you need
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
            Built for the way teams work
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <feature.icon size={16} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <div className="border-t border-slate-800 mx-5 md:mx-16" />

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="px-5 md:px-16 py-16 md:py-24 flex flex-col items-center text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight mb-3 max-w-xl">
          Ready to transform your workflow?
        </h2>
        <p className="text-sm text-slate-500 mb-8 max-w-md leading-relaxed">
          Join teams already using TaskFlow to organize their work and keep
          everyone aligned.
        </p>
        <button
          onClick={handleGetStarted}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Start for free
          <FiArrowRight size={15} />
        </button>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 px-5 md:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black leading-none">
              T
            </span>
          </div>
          <span className="text-sm font-bold text-slate-400 tracking-tight">
            TaskFlow
          </span>
        </div>
        <p className="text-xs text-slate-600">
          © 2026 TaskFlow. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
