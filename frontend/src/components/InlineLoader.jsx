import React from "react";
import { LockMorph } from "../logo";

// A compact inline loader for page sections (not full-screen)
const InlineLoader = ({ message = "Loading...", size = 56 }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LockMorph size={size} label="" variant="light" intensity="bold" speed={1.2} />
      <p className="mt-4 text-sm font-medium text-slate-700" role="status" aria-live="polite">{message}</p>
    </div>
  );
};

export default InlineLoader;
