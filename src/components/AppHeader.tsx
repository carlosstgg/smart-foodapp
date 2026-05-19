import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  back?: string;
  action?: React.ReactNode;
};

export default function AppHeader({ title, subtitle, back, action }: Props) {
  return (
    <header className="sticky top-0 z-30">
      <div className="glass-tint border-b border-white/40">
        <div className="px-5 py-4 flex items-center gap-3">
          {back && (
            <Link
              href={back}
              aria-label="Volver"
              className="tap size-10 rounded-full glass grid place-items-center text-zinc-800"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m14 6-6 6 6 6" />
              </svg>
            </Link>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-semibold tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[13px] text-zinc-600 truncate">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      </div>
    </header>
  );
}
