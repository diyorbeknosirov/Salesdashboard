"use client";

import { useMemo } from "react";
import { Play, Pause, Clock, AlertCircle } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { useWorkSession } from "@/hooks/useWorkSession";
import { useTasks } from "@/hooks/useTasks";

const TIME_TIPS = [
  "Har bir qo'ng'iroqdan oldin mijoz haqida qisqa eslatma tayyorlang.",
  "Kunni eng muhim 3 ta vazifadan boshlang.",
  "45 daqiqa ishlab, 5 daqiqa dam oling — bu samaradorlikni oshiradi.",
  "Rad javobi — yakuniy natija emas, keyingi qadamga tayyorgarlik.",
  "Har bir suhbatdan keyin natijani darhol yozib qo'ying.",
  "Kun oxirida ertangi rejangizni tayyorlab qo'ying.",
  "Mijozni tinglash — gapirishdan ko'ra muhimroq.",
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatHMS(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function timerColor(seconds) {
  const hours = seconds / 3600;
  if (hours >= 5) return COLORS.success;
  if (hours >= 4) return "#F5B301";
  return COLORS.danger;
}

export default function WorkTimerBar({ user }) {
  const { status, elapsedSeconds, autoPaused, ready, pause, resume } = useWorkSession(user);
  const { tasks } = useTasks(user);

  const tickerText = useMemo(() => {
    const today = todayStr();
    const pendingToday = tasks.filter((t) => t.status === "pending" && t.due_date === today);
    const taskItems = pendingToday.map((t) => `📌 ${t.title}${t.due_time ? " — " + t.due_time : ""}`);
    const tips = TIME_TIPS.map((t) => `💡 ${t}`);
    return [...taskItems, ...tips].join("     •     ");
  }, [tasks]);

  if (!user || user.role !== "operator" || !ready) return null;

  const color = timerColor(elapsedSeconds);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 px-3 sm:px-5 py-2.5 border-t bg-white"
      style={{ borderColor: COLORS.border, boxShadow: "0 -4px 16px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center gap-2 shrink-0">
        <Clock size={16} style={{ color }} />
        <span className="font-mono font-bold text-sm sm:text-base tabular-nums" style={{ color }}>
          {formatHMS(elapsedSeconds)}
        </span>
      </div>

      {status === "running" ? (
        <button
          onClick={pause}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0"
          style={{ background: COLORS.dangerBg, color: COLORS.danger }}
        >
          <Pause size={13} /> Pauza
        </button>
      ) : (
        <button
          onClick={resume}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0"
          style={{ background: COLORS.successBg, color: COLORS.success }}
        >
          <Play size={13} /> Davom ettirish
        </button>
      )}

      {autoPaused && (
        <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold shrink-0" style={{ color: COLORS.danger }}>
          <AlertCircle size={13} /> Harakatsizlik tufayli pauzaga qo'yildi
        </span>
      )}

      <div className="flex-1 min-w-0 overflow-hidden h-5 relative hidden md:block">
        <div className="ticker-track absolute whitespace-nowrap text-xs" style={{ color: COLORS.sub }}>
          {tickerText || "Bugun uchun vazifalar yo'q."}
        </div>
      </div>

      <style jsx>{`
        .ticker-track {
          animation: ticker-scroll 30s linear infinite;
          left: 100%;
        }
        @keyframes ticker-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-200%);
          }
        }
      `}</style>
    </div>
  );
}
