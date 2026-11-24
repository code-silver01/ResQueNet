import React from "react";

export default function SafetyBanner() {
  return (
    <div className="bg-[#EA4335] text-white font-bold py-2.5 px-4 text-center text-xs sm:text-sm shadow-md sticky top-0 z-50 flex items-center justify-center gap-2 tracking-wide border-b border-red-700">
      <span className="text-base animate-pulse">🚨</span>
      <span>In an emergency call 112 / local disaster helpline first. RESQNET does not dispatch rescue.</span>
    </div>
  );
}
