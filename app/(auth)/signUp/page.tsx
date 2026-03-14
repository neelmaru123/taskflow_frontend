"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiLock,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { register } from "@/app/_services/auth-service";
import { useBoards } from "@/app/_context/BoardContext";
import emailjs from "@emailjs/browser";

type ErrorState = { username: string; email: string; password: string };

// ─── Google button ────────────────────────────────────────────────────────────
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

// ─── Divider ──────────────────────────────────────────────────────────────────
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

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [tempData, setTempData] = useState<any>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [error, setError] = useState<ErrorState>({
    username: "",
    email: "",
    password: "",
  });

  const { fetchUser } = useBoards();
  const router = useRouter();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Google sign-up ──────────────────────────────────────────────────────────
  function handleGoogleSignUp() {
    // Replace with your actual Google OAuth redirect / handler
    window.location.href = "/api/auth/google";
  }

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  async function handleInitRegistration(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries()) as any;

    const newError = { username: "", email: "", password: "" };
    if (!data.username.trim()) newError.username = "Username is required";
    if (!data.email.trim()) newError.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      newError.email = "Enter a valid email address";
    if (!data.password.trim()) newError.password = "Password is required";
    else if (data.password.length < 8)
      newError.password = "Minimum 8 characters required";

    if (newError.username || newError.email || newError.password) {
      setError(newError);
      return;
    }

    setIsLoading(true);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await emailjs.send(
        "service_lmlhdrp",
        "template_a7y4gjf",
        { email: data.email, otp_code: otpCode },
        "F5r3zmO0Rod_evvZ-",
      );
      setGeneratedOtp(otpCode);
      setTempData(data);
      setStep(2);
      toast.success("Verification code sent!");
    } catch {
      toast.error("Failed to send code. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  // ── Step 2: Verify OTP and register ────────────────────────────────────────
  async function handleVerifyAndRegister() {
    if (otp.join("") !== generatedOtp) {
      toast.error("Invalid verification code");
      return;
    }
    setIsLoading(true);
    try {
      await register(tempData);
      toast.success("Account created successfully!");
      setOtp(["", "", "", "", "", ""]);
      setGeneratedOtp(null);
      await fetchUser();
      router.replace("/dashboard/board");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/landing-page" className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-black">T</span>
        </div>
        <span className="text-lg font-bold text-slate-100 tracking-tight">
          TaskFlow
        </span>
      </Link>

      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-0.5 bg-blue-600/60 w-full" />

        <div className="px-6 py-7">
          {step === 1 ? (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                  Create your account
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Start organizing your work today
                </p>
              </div>

              {/* Google sign up */}
              <GoogleButton
                label="Sign up with Google"
                onClick={handleGoogleSignUp}
              />

              <OrDivider />

              <form onSubmit={handleInitRegistration} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    <FiUser size={10} /> Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="yourname"
                    onChange={() => setError((p) => ({ ...p, username: "" }))}
                    className={`w-full px-3 py-2.5 text-sm bg-slate-800 border text-slate-200 placeholder:text-slate-600 rounded-xl outline-none transition-colors ${
                      error.username
                        ? "border-red-500/60"
                        : "border-slate-700 focus:border-blue-500/60"
                    }`}
                  />
                  {error.username && (
                    <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400">
                      <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                      {error.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    <FiMail size={10} /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    onChange={() => setError((p) => ({ ...p, email: "" }))}
                    className={`w-full px-3 py-2.5 text-sm bg-slate-800 border text-slate-200 placeholder:text-slate-600 rounded-xl outline-none transition-colors ${
                      error.email
                        ? "border-red-500/60"
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
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    <FiLock size={10} /> Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Min. 8 characters"
                      onChange={() => setError((p) => ({ ...p, password: "" }))}
                      className={`w-full px-3 py-2.5 pr-10 text-sm bg-slate-800 border text-slate-200 placeholder:text-slate-600 rounded-xl outline-none transition-colors ${
                        error.password
                          ? "border-red-500/60"
                          : "border-slate-700 focus:border-blue-500/60"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                    >
                      {showPassword ? (
                        <FiEyeOff size={15} />
                      ) : (
                        <FiEye size={15} />
                      )}
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
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Create Account <FiArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-slate-300 hover:text-white font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            /* OTP view — unchanged */
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield size={24} />
              </div>
              <h1 className="text-xl font-bold text-slate-100">Verify Email</h1>
              <p className="text-xs text-slate-500 mt-2 mb-6">
                Enter the code sent to <br />
                <span className="text-slate-300">{tempData?.email}</span>
              </p>
              <div className="flex justify-between gap-2 mb-8">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="w-10 h-12 bg-slate-800 border border-slate-700 text-center text-lg font-bold text-white rounded-lg focus:border-blue-500 outline-none transition-all"
                  />
                ))}
              </div>
              <button
                onClick={handleVerifyAndRegister}
                disabled={isLoading}
                className="w-full bg-blue-600 py-2.5 rounded-xl text-white font-bold hover:bg-blue-500 disabled:opacity-60 transition-colors"
              >
                {isLoading ? "Verifying..." : "Verify & Complete"}
              </button>
              <button
                onClick={() => setStep(1)}
                className="mt-6 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Entered the wrong email?{" "}
                <span className="underline">Go back</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
