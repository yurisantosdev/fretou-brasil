import type { ReactNode, RefObject } from "react";

export type ModalSize = "lg" | "xl";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  showCloseButton?: boolean;
  size?: ModalSize;
  panelClassName?: string;
};
