import React from "react";

const base =
  "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  default: "bg-slate-900 text-white hover:opacity-90",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
  outline: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
  destructive: "bg-red-600 text-white hover:opacity-90",
};

export function Button({ variant = "default", className = "", ...props }) {
  const v = variants[variant] || variants.default;
  return <button className={`${base} ${v} ${className}`} {...props} />;
}
