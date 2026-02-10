import React from "react";

export function Alert({ variant, className = "", ...props }) {
  const styles =
    variant === "destructive"
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-slate-200 bg-slate-50 text-slate-900";
  return <div className={`rounded-2xl border p-4 ${styles} ${className}`} {...props} />;
}

export function AlertTitle({ className = "", ...props }) {
  return <div className={`text-sm font-semibold ${className}`} {...props} />;
}

export function AlertDescription({ className = "", ...props }) {
  return <div className={`text-sm mt-1 ${className}`} {...props} />;
}
