// src/ui/button.jsx
import React from "react";

const variants = {
  default: "px-6 py-2 bg-amber-700 text-amber-700 rounded-lg hover:bg-amber-800",
  outline: "px-6 py-2 bg-amber-700 text-amber-700 rounded-lg hover:bg-amber-800",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
};
const sizes = {
  sm: "px-2 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export function Button({
  children,
  onClick,
  type = "button",
  variant = "default",
  size = "md",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-lg transition ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
