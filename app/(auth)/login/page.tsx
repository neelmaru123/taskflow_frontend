"use client";

import { useBoards } from "@/app/_context/BoardContext";
import { login } from "@/app/_services/auth-service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiArrowRight,
  FiShield,
  FiArrowLeft,
} from "react-icons/fi";
import emailjs from "@emailjs/browser";
import { resetPassword } from "@/app/_services/user.service";

type ErrorState = { email: string; password: string };
type ForgotStep = "idle" | "input" | "otp" | "reset" | "done";

// ─── Google button (shared) ───────────────────────────────────────────────────
function GoogleButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors"
    >
      {/* Google "G" SVG */}
      <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
        <path
          d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
          fill="#FFC107"
        />
        <path
          d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
          fill="#FF3D00"
        />
        <path
          d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.316 0-9.828-3.337-11.562-8H6.306A19.941 19.941 0 0 0 24 44z"
          fill="#4CAF50"
        />
        <path
          d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C42.012 35.245 44 30 44 24c0-1.341-.138-2.65-.389-3.917z"
          fill="#1976D2"
        />
      </svg>
      {label}
    </button>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-slate-800" />
      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
        or
      </span>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorState>({ email: "", password: "" });

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<ForgotStep>("idle");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const router = useRouter();
  const { fetchUser } = useBoards();

  // ── Login submit ────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const formData = Object.fromEntries(fd.entries()) as Record<string, string>;
    const newError = { email: "", password: "" };

    if (!formData.email.trim()) {
      setError({ ...newError, email: "Email is required" });
      return;
    }
    if (!formData.password) {
      setError({ ...newError, password: "Password is required" });
      return;
    }

    setIsLoading(true);
    try {
      await login(formData as any);
      toast.success("Welcome back!");
      await fetchUser();
      router.replace("/dashboard/board");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Google sign-in ──────────────────────────────────────────────────────────
  function handleGoogleLogin() {
    // Replace with your actual Google OAuth redirect / handler
    window.location.href = "/api/auth/google";
  }

  // ── Forgot: send OTP ────────────────────────────────────────────────────────
  async function handleSendForgotOtp() {
    if (
      !forgotEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)
    ) {
      toast.error("Enter a valid email address");
      return;
    }
    setForgotLoading(true);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await emailjs.send(
        "service_lmlhdrp",
        "template_a7y4gjf",
        { email: forgotEmail, otp_code: otpCode },
        "F5r3zmO0Rod_evvZ-",
      );
      setGeneratedOtp(otpCode);
      setForgotStep("otp");
      toast.success("Reset code sent!");
    } catch {
      toast.error("Failed to send code. Try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  // ── Forgot: verify OTP ──────────────────────────────────────────────────────
  function handleVerifyForgotOtp() {
    if (forgotOtp.join("") !== generatedOtp) {
      toast.error("Invalid code");
      return;
    }
    setForgotStep("reset");
  }

  // ── Forgot: reset password ──────────────────────────────────────────────────
  async function handleResetPassword() {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setForgotLoading(true);
    try {
      // Replace with your actual reset-password API call
      await resetPassword(newPassword, forgotEmail);
      toast.success("Password reset! Please sign in.");
      setForgotStep("idle");
      setForgotEmail("");
      setForgotOtp(["", "", "", "", "", ""]);
      setGeneratedOtp(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to reset password. Try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const next = [...forgotOtp];
    next[index] = value.slice(-1);
    setForgotOtp(next);
    if (value && index < 5) {
      (
        document.getElementById(`fotp-${index + 1}`) as HTMLInputElement
      )?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !forgotOtp[index] && index > 0) {
      (
        document.getElementById(`fotp-${index - 1}`) as HTMLInputElement
      )?.focus();
    }
  };

  // ── Forgot password overlay ─────────────────────────────────────────────────
  if (forgotStep !== "idle") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
        <Link href="/landing-page" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-black leading-none">
              T
            </span>
          </div>
          <span className="text-lg font-bold text-slate-100 tracking-tight">
            TaskFlow
          </span>
        </Link>

        <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-0.5 bg-blue-600/60 w-full" />
          <div className="px-6 py-7">
            {/* Step: enter email */}
            {forgotStep === "input" && (
              <>
                <button
                  onClick={() => setForgotStep("idle")}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-5 transition-colors"
                >
                  <FiArrowLeft size={13} /> Back to sign in
                </button>
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                    Forgot password
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    We'll send a reset code to your email
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      <FiMail size={10} /> Email
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2.5 text-sm bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-600 rounded-xl outline-none focus:border-blue-500/60 transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleSendForgotOtp}
                    disabled={forgotLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    {forgotLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                        Sending...
                      </>
                    ) : (
                      <>
                        {" "}
                        Send reset code <FiArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Step: OTP */}
            {forgotStep === "otp" && (
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShield size={24} />
                </div>
                <h1 className="text-xl font-bold text-slate-100">
                  Enter reset code
                </h1>
                <p className="text-xs text-slate-500 mt-2 mb-6">
                  Code sent to{" "}
                  <span className="text-slate-300">{forgotEmail}</span>
                </p>
                <div className="flex justify-between gap-2 mb-6">
                  {forgotOtp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`fotp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className="w-10 h-12 bg-slate-800 border border-slate-700 text-center text-lg font-bold text-white rounded-lg focus:border-blue-500 outline-none transition-all"
                    />
                  ))}
                </div>
                <button
                  onClick={handleVerifyForgotOtp}
                  className="w-full bg-blue-600 py-2.5 rounded-xl text-white font-semibold hover:bg-blue-500 transition-colors"
                >
                  Verify code
                </button>
                <button
                  onClick={() => setForgotStep("input")}
                  className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors underline"
                >
                  Wrong email? Go back
                </button>
              </div>
            )}

            {/* Step: new password */}
            {forgotStep === "reset" && (
              <>
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                    Set new password
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Choose a strong password
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      <FiLock size={10} /> New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full px-3 py-2.5 pr-10 text-sm bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-600 rounded-xl outline-none focus:border-blue-500/60 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showNewPassword ? (
                          <FiEyeOff size={15} />
                        ) : (
                          <FiEye size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      <FiLock size={10} /> Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-3 py-2.5 text-sm bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-600 rounded-xl outline-none focus:border-blue-500/60 transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleResetPassword}
                    disabled={forgotLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    {forgotLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                        Resetting...
                      </>
                    ) : (
                      <>
                        {" "}
                        Reset password <FiArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main login view ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/landing-page" className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-black leading-none">T</span>
        </div>
        <span className="text-lg font-bold text-slate-100 tracking-tight">
          TaskFlow
        </span>
      </Link>

      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
        <div className="h-0.5 bg-blue-600/60 w-full" />

        <div className="px-6 py-7">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to your workspace
            </p>
          </div>

          {/* Google sign in */}
          <GoogleButton
            label="Sign in with Google"
            onClick={handleGoogleLogin}
          />

          <OrDivider />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                <FiMail size={10} /> Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                onChange={() => setError((p) => ({ ...p, email: "" }))}
                className={`w-full px-3 py-2.5 text-sm bg-slate-800 border text-slate-200 placeholder:text-slate-600 rounded-xl outline-none transition-colors ${
                  error.email
                    ? "border-red-500/60 focus:border-red-500/80"
                    : "border-slate-700 focus:border-blue-500/60"
                }`}
              />
              {error.email && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400">
                  <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                  {error.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <FiLock size={10} /> Password
                </label>
                {/* Forgot password link */}
                <button
                  type="button"
                  onClick={() => setForgotStep("input")}
                  className="text-[10px] font-medium text-slate-500 hover:text-blue-400 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onChange={() => setError((p) => ({ ...p, password: "" }))}
                  className={`w-full px-3 py-2.5 pr-10 text-sm bg-slate-800 border text-slate-200 placeholder:text-slate-600 rounded-xl outline-none transition-colors ${
                    error.password
                      ? "border-red-500/60 focus:border-red-500/80"
                      : "border-slate-700 focus:border-blue-500/60"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {error.password && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400">
                  <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                  {error.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Signing in...
                </>
              ) : (
                <>
                  Sign in <FiArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signUp"
                className="text-slate-300 hover:text-white font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
