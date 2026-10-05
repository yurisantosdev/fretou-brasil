"use client";

import { CalendarBlankIcon, CaretDownIcon, CaretLeftIcon, CaretRightIcon, ClockIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { DatePickerProps } from "../types/datePicker";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"] as const;

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

const MONTHS_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

const YEAR_GRID_SIZE = 12;
const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

type CalendarView = "days" | "months" | "years";

function getYearRangeStart(year: number): number {
  return Math.floor(year / YEAR_GRID_SIZE) * YEAR_GRID_SIZE;
}

function pickerCellClass(isSelected: boolean, isCurrent: boolean): string {
  return [
    "flex h-full w-full cursor-pointer items-center justify-center rounded-xl text-xs font-semibold transition",
    isSelected
      ? "bg-brand text-white"
      : isCurrent
        ? "bg-brand/10 text-brand ring-1 ring-brand/30"
        : "text-navy hover:bg-canvas",
  ].join(" ");
}

function toInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseInputValue(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function currentTimeValue(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function parseTimeValue(value: string): string {
  const time = value.split("T")[1]?.slice(0, 5);
  return time && /^\d{2}:\d{2}$/.test(time) ? time : currentTimeValue();
}

function buildMonthGrid(visibleMonth: Date): Date[] {
  const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1, 12, 0, 0, 0);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    day.setHours(12, 0, 0, 0);
    return day;
  });
}

export function DatePicker({
  id,
  value,
  onChange,
  disabled = false,
  fixedPopover = true,
  allowClear = true,
  showToday = true,
  placeholder = "Selecione uma data",
  size = "md",
  showTime = false,
  min,
}: DatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<CalendarView>("days");
  const viewRef = useRef<CalendarView>("days");
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  viewRef.current = view;

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    return now;
  }, []);

  const selectedDate = useMemo(() => parseInputValue(value), [value]);
  const selectedTime = useMemo(() => parseTimeValue(value), [value]);
  const minDate = useMemo(() => (min ? parseInputValue(min) : null), [min]);

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const anchor = selectedDate ?? today;
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12, 0, 0, 0);
  });

  useEffect(() => {
    if (!open) setView("days");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const anchor = selectedDate ?? today;
    setVisibleMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12, 0, 0, 0));
  }, [open, selectedDate, today]);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      if (!fixedPopover || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = showTime ? 432 : 288;
      const popoverHeight = showTime ? 420 : 340;
      const gap = 8;
      const padding = 12;
      let top = rect.bottom + gap;
      let left = rect.left;

      if (top + popoverHeight > window.innerHeight - padding) {
        top = Math.max(padding, rect.top - popoverHeight - gap);
      }
      if (left + popoverWidth > window.innerWidth - padding) {
        left = window.innerWidth - popoverWidth - padding;
      }
      if (left < padding) left = padding;

      setPopoverPosition({ top, left });
    }

    updatePosition();

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !target.closest("[data-date-picker-popover]")
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      if (viewRef.current === "years") {
        setView("months");
        return;
      }
      if (viewRef.current === "months") {
        setView("days");
        return;
      }
      setOpen(false);
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [fixedPopover, open, showTime]);

  const monthGrid = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);

  function isBeforeMin(date: Date): boolean {
    return minDate ? toInputValue(date) < toInputValue(minDate) : false;
  }

  function emitValue(date: Date, time = selectedTime) {
    onChange(showTime ? `${toInputValue(date)}T${time}` : toInputValue(date));
  }

  function pickDate(date: Date) {
    if (isBeforeMin(date)) return;
    emitValue(date);
    setView("days");
    if (!showTime) setOpen(false);
  }

  function pickTime(hour: string, minute: string) {
    const date = selectedDate ?? today;
    if (isBeforeMin(date)) return;
    emitValue(date, `${hour}:${minute}`);
  }

  function shiftVisibleMonth(years: number, months = 0) {
    setVisibleMonth(
      new Date(visibleMonth.getFullYear() + years, visibleMonth.getMonth() + months, 1, 12, 0, 0, 0)
    );
  }

  function handleHeaderClick() {
    if (view === "days") setView("months");
    else if (view === "months") setView("years");
    else setView("months");
  }

  function pickMonth(monthIndex: number) {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), monthIndex, 1, 12, 0, 0, 0));
    setView("days");
  }

  function pickYear(year: number) {
    setVisibleMonth(new Date(year, visibleMonth.getMonth(), 1, 12, 0, 0, 0));
    setView("months");
  }

  const yearRangeStart = getYearRangeStart(visibleMonth.getFullYear());
  const yearGrid = Array.from({ length: YEAR_GRID_SIZE }, (_, index) => yearRangeStart + index);

  const headerLabel =
    view === "days"
      ? `${MONTHS[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`
      : view === "months"
        ? String(visibleMonth.getFullYear())
        : `${yearRangeStart} – ${yearRangeStart + YEAR_GRID_SIZE - 1}`;

  const dateLabel = selectedDate ? formatShortDate(selectedDate) : placeholder;

  const popover =
    open && (!fixedPopover || popoverPosition) ? (
      <div
        data-date-picker-popover=""
        className={[
          "rounded-2xl border border-line bg-white p-3 shadow-[0_24px_80px_rgba(13,32,86,0.22)]",
          showTime ? "w-108 max-w-[calc(100vw-1.5rem)]" : "w-72",
          fixedPopover ? "fixed z-80" : "absolute left-0 top-full z-30 mt-2",
        ].join(" ")}
        style={
          fixedPopover && popoverPosition
            ? { top: popoverPosition.top, left: popoverPosition.left }
            : undefined
        }
      >
        <div className={showTime ? "flex gap-3" : ""}>
        <div className={showTime ? "min-w-0 flex-1" : ""}>
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            aria-label={
              view === "days" ? "Mês anterior" : view === "months" ? "Ano anterior" : "Anos anteriores"
            }
            onClick={() => {
              if (view === "days") shiftVisibleMonth(0, -1);
              else if (view === "months") shiftVisibleMonth(-1);
              else shiftVisibleMonth(-YEAR_GRID_SIZE);
            }}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-xl text-muted transition hover:bg-canvas hover:text-navy"
          >
            <CaretLeftIcon size={14} weight="bold" />
          </button>
          <button
            type="button"
            aria-expanded={view !== "days"}
            aria-label={
              view === "days" ? "Escolher mês e ano" : view === "months" ? "Escolher ano" : "Voltar para meses"
            }
            onClick={handleHeaderClick}
            className="inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl px-2 py-1 text-sm font-semibold text-navy transition hover:bg-canvas"
          >
            <span className="truncate">{headerLabel}</span>
            <CaretDownIcon
              size={12}
              weight="bold"
              className={["shrink-0 text-faint transition-transform", view === "years" ? "rotate-180" : ""].join(" ")}
            />
          </button>
          <button
            type="button"
            aria-label={view === "days" ? "Próximo mês" : view === "months" ? "Próximo ano" : "Próximos anos"}
            onClick={() => {
              if (view === "days") shiftVisibleMonth(0, 1);
              else if (view === "months") shiftVisibleMonth(1);
              else shiftVisibleMonth(YEAR_GRID_SIZE);
            }}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-xl text-muted transition hover:bg-canvas hover:text-navy"
          >
            <CaretRightIcon size={14} weight="bold" />
          </button>
        </div>

        {view === "days" ? (
          <>
            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((label, index) => (
                <div
                  key={`${label}-${index}`}
                  className="py-1 text-center text-[10px] font-semibold tracking-wide text-faint uppercase"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthGrid.map((day) => {
                const inCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isToday = isSameDay(day, today);
                const blocked = isBeforeMin(day);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={blocked}
                    onClick={() => pickDate(day)}
                    className={[
                      "flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition",
                      blocked
                        ? "cursor-not-allowed text-placeholder/40"
                        : isSelected
                          ? "cursor-pointer bg-brand text-white"
                          : isToday
                            ? "cursor-pointer bg-brand/10 text-brand ring-1 ring-brand/30"
                            : inCurrentMonth
                              ? "cursor-pointer text-navy hover:bg-canvas"
                              : "cursor-pointer text-placeholder hover:bg-canvas",
                    ].join(" ")}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="grid min-h-62 grid-cols-3 grid-rows-4 gap-1.5">
            {view === "months"
              ? MONTHS_SHORT.map((label, monthIndex) => {
                  const isSelected =
                    selectedDate?.getMonth() === monthIndex &&
                    selectedDate.getFullYear() === visibleMonth.getFullYear();
                  const isCurrent =
                    today.getMonth() === monthIndex && today.getFullYear() === visibleMonth.getFullYear();

                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => pickMonth(monthIndex)}
                      className={pickerCellClass(isSelected, isCurrent)}
                    >
                      {label}
                    </button>
                  );
                })
              : yearGrid.map((year) => {
                  const isSelected = selectedDate?.getFullYear() === year;
                  const isCurrent = today.getFullYear() === year;

                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => pickYear(year)}
                      className={pickerCellClass(isSelected, isCurrent)}
                    >
                      {year}
                    </button>
                  );
                })}
          </div>
        )}
        </div>
        {showTime ? (
          <div className="flex w-30 shrink-0 gap-1 border-l border-line pl-3">
            <TimeColumn
              label="Hora"
              options={HOURS}
              value={selectedTime.slice(0, 2)}
              onSelect={(hour) => pickTime(hour, selectedTime.slice(3))}
            />
            <TimeColumn
              label="Min"
              options={MINUTES}
              value={selectedTime.slice(3)}
              onSelect={(minute) => pickTime(selectedTime.slice(0, 2), minute)}
            />
          </div>
        ) : null}
        </div>

        {showToday || showTime || (allowClear && value) ? (
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            {showToday ? (
              <button
                type="button"
                disabled={isBeforeMin(today)}
                onClick={() => {
                  if (isBeforeMin(today)) return;
                  if (showTime) {
                    emitValue(new Date(), currentTimeValue());
                    setOpen(false);
                    return;
                  }
                  pickDate(today);
                }}
                className="cursor-pointer text-xs font-semibold text-brand transition hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                {showTime ? "Agora" : "Hoje"}
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              {allowClear && value ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="cursor-pointer text-xs font-medium text-faint transition hover:text-navy"
                >
                  Limpar
                </button>
              ) : null}
              {showTime ? (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-dark"
                >
                  Pronto
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    ) : null;

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={[
          "flex w-full cursor-pointer items-center gap-2 rounded-xl border bg-white text-left outline-none transition disabled:cursor-not-allowed disabled:opacity-60",
          size === "sm" ? "h-10 px-3 text-sm font-semibold" : "h-11 px-4 text-base",
          open ? "border-brand shadow-[0_0_0_4px_rgba(28,68,242,0.14)]" : "border-line",
        ].join(" ")}
      >
        <CalendarBlankIcon size={16} className="shrink-0 text-faint" />
        <span className={["min-w-0 truncate", selectedDate ? "text-navy" : "text-placeholder"].join(" ")}>
          {dateLabel}
        </span>
        {showTime && selectedDate ? (
          <>
            <span className="text-line" aria-hidden>
              ·
            </span>
            <ClockIcon size={16} className="shrink-0 text-faint" />
            <span className="shrink-0 tabular-nums text-navy">{selectedTime}</span>
          </>
        ) : null}
      </button>

      {popover && (fixedPopover && typeof document !== "undefined" ? createPortal(popover, document.body) : popover)}
    </div>
  );
}

function TimeColumn({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: string[];
  value: string;
  onSelect: (next: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>("[data-active='true']");
    if (!list || !active) return;
    list.scrollTop = active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2;
  }, [value]);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <p className="mb-1.5 text-center text-[10px] font-semibold tracking-wide text-faint uppercase">{label}</p>
      <div ref={listRef} className="h-64 overflow-y-auto overscroll-contain">
        {options.map((option) => {
          const isActive = option === value;
          return (
            <button
              key={option}
              type="button"
              data-active={isActive}
              onClick={() => onSelect(option)}
              className={[
                "flex h-8 w-full cursor-pointer items-center justify-center rounded-lg text-xs font-semibold tabular-nums transition",
                isActive ? "bg-brand text-white" : "text-navy hover:bg-canvas",
              ].join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
