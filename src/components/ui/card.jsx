import React from "react";

export function Card({ className = "", ...props }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }) {
  return <div className={`p-4 md:p-5 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }) {
  return <div className={`font-semibold tracking-tight ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }) {
  return <div className={`p-4 md:p-5 pt-0 ${className}`} {...props} />;
}
