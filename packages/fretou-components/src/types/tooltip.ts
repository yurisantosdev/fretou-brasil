import type { ReactNode } from "react";

export type TooltipProps = {
  label: string;
  side?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
};