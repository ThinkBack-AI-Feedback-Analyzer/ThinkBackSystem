import React from "react";
import { ArrowRight } from "lucide-react";
import studentlogo from "../assets/logo_4.png";

export default function StudentFeedbackPortal() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f8fcf9_0%,#edf7f0_28%,#dbeede_100%)] px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-96px] top-[-72px] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(247,255,250,0.78)_0%,rgba(247,255,250,0)_72%)] blur-[12px]" />
        <div className="absolute right-[-110px] top-[18%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(186,223,198,0.56)_0%,rgba(186,223,198,0)_72%)]" />
        <div className="absolute bottom-[-110px] right-[-90px] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(27,90,61,0.18)_0%,rgba(27,90,61,0)_72%)]" />
        <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0)_100%)]" />
      </div>

      <div className="relative z-[1] flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center">

        {/* Logo + Heading */}
        <div className="text-center mb-10">
          <img
            src={studentlogo}
            alt="University Logo"
            className="w-20 mx-auto mb-4"
          />

          <h1 className="text-3xl font-bold leading-tight">
            <span className="bg-[linear-gradient(135deg,#184d35_0%,#2c7a55_55%,#63a77f_100%)] bg-clip-text text-transparent">
              Student Feedback Portal
            </span>
          </h1>
        </div>

        {/* Card */}
        <div className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-[rgba(158,196,171,0.7)] bg-[linear-gradient(135deg,rgba(232,247,237,0.92)_0%,rgba(186,223,198,0.78)_42%,rgba(108,169,130,0.58)_100%)] p-8 shadow-[0_24px_54px_rgba(24,77,53,0.18),0_0_32px_rgba(73,161,116,0.10)] backdrop-blur-[14px]">
          <div className="pointer-events-none absolute left-[-28px] top-[-24px] h-[100px] w-[140px] rounded-full bg-[rgba(247,255,250,0.58)] blur-[26px]" />
          <div className="pointer-events-none absolute bottom-[-28px] right-[-26px] h-[110px] w-[150px] rounded-full bg-[rgba(27,90,61,0.16)] blur-[30px]" />

          <div className="relative z-[1]">

            <h2 className="text-xl font-semibold mb-1">
              <span className="bg-[linear-gradient(135deg,#123726_0%,#1d583d_100%)] bg-clip-text text-transparent">
                Student Verification
              </span>
            </h2>

            <p className="mb-6 text-sm text-[#456354]">
              Please enter your Student ID to continue
            </p>

            {/* Label */}
            <label className="text-sm font-semibold text-[#1b4732]">
              Student ID
            </label>

            {/* Instruction */}
            <p className="mb-2 text-xs text-[#4a6758]">
              Your student ID can be found on your student card or the university portal
            </p>

            {/* Input */}
            <input
              type="text"
              placeholder="Enter your Student ID"
              className="mb-6 w-full rounded-lg border border-[rgba(132,177,150,0.85)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(242,248,244,0.82)_100%)] px-4 py-3 text-[#173f2c] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_24px_rgba(24,77,53,0.08)] outline-none transition-all duration-200 placeholder:text-[#6d8478] focus:border-[#185237] focus:shadow-[0_0_0_4px_rgba(24,77,53,0.12),0_18px_36px_rgba(24,77,53,0.14)]"
            />

            {/* Button */}
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#13462d] py-3 font-semibold text-white shadow-[0_16px_32px_rgba(24,77,53,0.22)] transition-all duration-200 hover:bg-[#0f3724] hover:shadow-[0_18px_36px_rgba(24,77,53,0.28)]">
              Verify
              <ArrowRight size={18} />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
