"use client";

import { useState } from "react";

interface Props {
  icon: string;
  label: string;
  value: string;
  explanation: string;
  accentBg: string;
  accentText: string;
  source: { name: string; url: string };
}

export default function ImpactTile({ icon, label, value, explanation, accentBg, accentText, source }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="relative glass glass-shine rounded-3xl p-4">
        <button
          onClick={() => setOpen(true)}
          className="absolute top-2.5 right-2.5 size-5 rounded-full bg-black/[0.07] grid place-items-center text-zinc-400 text-[11px] font-bold hover:bg-black/[0.12] transition-colors"
          aria-label="Cómo se calcula"
        >
          ?
        </button>
        <div className={`size-9 rounded-full ${accentBg} grid place-items-center text-xl`}>{icon}</div>
        <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mt-2">{label}</p>
        <p className={`text-[22px] font-semibold ${accentText} tabular-nums`}>{value}</p>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-[calc(max(env(safe-area-inset-bottom),10px)+84px)] px-4 bg-black/20 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm glass-strong rounded-3xl p-5 shadow-xl border border-white/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm">{label}</span>
              <button
                onClick={() => setOpen(false)}
                className="size-6 rounded-full bg-black/[0.07] grid place-items-center text-zinc-500 text-sm hover:bg-black/[0.12] transition-colors"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <p className="text-[13px] text-zinc-600 leading-relaxed">{explanation}</p>
            <div className="mt-3 pt-3 border-t border-black/[0.06]">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-0.5">Fuente</p>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] text-sky-600 underline underline-offset-2 break-all"
              >
                {source.name}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
