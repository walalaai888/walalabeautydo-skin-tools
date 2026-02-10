import React from "react";

const variants = {
  default: "bg-slate-900 text-white",
  secondary: "bg-slate-100 text-slate-900 border border-slate-200",
  outline: "bg-white text-slate-900 border border-slate-200",
};

export function Badge({ variant = "default", className = "", ...props }) {
  const v = variants[variant] || variants.default;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${v} ${className}`}
      {...props}
    />
  );
}
