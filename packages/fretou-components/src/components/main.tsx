"use client";

import React from "react";
import { ToastContainer } from "react-toastify";

export function Main({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <ToastContainer />
    </div>
  );
}
