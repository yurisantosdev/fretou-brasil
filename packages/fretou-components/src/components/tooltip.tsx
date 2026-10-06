"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TooltipProps } from "../types/tooltip";

const GAP = 6;

type Side = NonNullable<TooltipProps["side"]>;

const placement: Record<Side, { transform: string; arrow: string }> = {
  top: {
    transform: "translate(-50%, -100%)",
    arrow: "left-1/2 top-full -translate-x-1/2 -translate-y-1/2",
  },
  bottom: {
    transform: "translate(-50%, 0)",
    arrow: "left-1/2 bottom-full -translate-x-1/2 translate-y-1/2",
  },
  left: {
    transform: "translate(-100%, -50%)",
    arrow: "left-full top-1/2 -translate-x-1/2 -translate-y-1/2",
  },
  right: {
    transform: "translate(0, -50%)",
    arrow: "right-full top-1/2 translate-x-1/2 -translate-y-1/2",
  },
};

export function Tooltip({ label, children, side = "top" }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (side === "bottom") {
      setPosition({ top: rect.bottom + GAP, left: centerX });
      return;
    }
    if (side === "left") {
      setPosition({ top: centerY, left: rect.left - GAP });
      return;
    }
    if (side === "right") {
      setPosition({ top: centerY, left: rect.right + GAP });
      return;
    }
    setPosition({ top: rect.top - GAP, left: centerX });
  }, [side]);

  useEffect(() => {
    if (!open) return;

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  function show() {
    updatePosition();
    setOpen(true);
  }

  function hide() {
    setOpen(false);
  }

  const place = placement[side];
  const tooltip =
    open && position && typeof document !== "undefined"
      ? createPortal(
          <span
            role="tooltip"
            className="pointer-events-none fixed z-[90] whitespace-nowrap rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white shadow-[0_8px_24px_rgba(24,24,27,0.28)]"
            style={{ top: position.top, left: position.left, transform: place.transform }}
          >
            {label}
            <span aria-hidden className={`absolute h-1.5 w-1.5 rotate-45 bg-zinc-900 ${place.arrow}`} />
          </span>,
          document.body
        )
      : null;

  return (
    <span
      ref={triggerRef}
      className="group/tooltip relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
    >
      {children}
      {tooltip}
    </span>
  );
}
