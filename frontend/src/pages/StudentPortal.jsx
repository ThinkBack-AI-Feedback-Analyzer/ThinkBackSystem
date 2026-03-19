import React from "react";
import { ArrowRight } from "lucide-react";
import studentlogo from "../assets/logo_4.png";

export default function StudentFeedbackPortal() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      {/* Logo + Heading */}
      <div className="text-center mb-10">
        <img
          src={studentlogo}
          alt="University Logo"
          className="w-20 mx-auto mb-4"
        />

        <h1 className="text-3xl font-bold text-gray-800">
          Student Feedback Portal
        </h1>
      </div>

      {/* Card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 border border-gray-100">

        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Student Verification
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Please enter your Student ID to continue
        </p>

        {/* Label */}
        <label className="text-sm font-semibold text-gray-700">
          Student ID
        </label>

        {/* Instruction */}
        <p className="text-xs text-gray-500 mb-2">
          Your student ID can be found on your student card or the university portal
        </p>

        {/* Input */}
        <input
          type="text"
          placeholder="Enter your Student ID"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-[#13462d]"
        />

        {/* Button */}
        <button className="w-full flex items-center justify-center gap-2 bg-[#13462d] hover:bg-[#0f3724] text-white py-3 rounded-lg font-semibold transition-all duration-200">
          Verify
          <ArrowRight size={18} />
        </button>

      </div>

    </div>
  );
}