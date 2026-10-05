import Link from "next/link";
import { CardModuleType } from "../../types/cardModule";

export function CardModule({
  title,
  description,
  icon,
  color,
  href,
}: CardModuleType) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(13,32,86,0.06)] transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_18px_40px_rgba(13,32,86,0.12)]"
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`grid size-12 place-items-center rounded-xl text-white ${color}`}>
          {icon}
        </span>
        <span className="grid size-9 place-items-center rounded-full text-faint transition group-hover:bg-canvas group-hover:text-brand">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M7 17 17 7M9 7h8v8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <h3 className="mt-5 text-lg font-bold tracking-tight text-navy">{title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{description}</p>

      <span className="mt-5 inline-flex items-center gap-1.5 border-t border-line pt-4 text-sm font-semibold text-brand">
        Acessar módulo
        <svg
          className="transition duration-300 group-hover:translate-x-0.5"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}
