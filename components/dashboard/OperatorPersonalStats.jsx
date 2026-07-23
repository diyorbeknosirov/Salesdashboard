import { Wallet, Target, CircleDollarSign, Sparkles, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { fmt } from "@/lib/format";
import { BONUS_TIERS } from "@/lib/bonus";
import { computeTotalIncome } from "@/lib/salary";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import ProgressBar from "@/components/ui/ProgressBar";

export default function OperatorPersonalStats({ operator, todaySold = 0, workSessions = [], leadStats = [] }) {
  const pct = operator.monthlyPlan ? (operator.sold / operator.monthlyPlan) * 100 : 0;
  const dailyPlan = Math.round(operator.monthlyPlan / 26);
  const soldToday = todaySold;
  const dayPct = dailyPlan ? (soldToday / dailyPlan) * 100 : 0;
  const remainingDays = Math.max(1, 26 - new Date().getDate());
  const forecast = operator.sold + (operator.sold / new Date().getDate()) * remainingDays;
  const forecastPct = operator.monthlyPlan ? (forecast / operator.monthlyPlan) * 100 : 0;
  const activeTierIndex = BONUS_TIERS.findIndex((t) => t.rate === operator.bonusRate);

  const income = computeTotalIncome(operator, workSessions, leadStats);

  const stats = [
    { label: "Oylik sotuv", value: fmt(operator.sold) + " so'm", icon: Wallet, tone: COLORS.primary },
    { label: "Reja bajarilishi", value: pct.toFixed(0) + "%", icon: Target, tone: pct >= 100 ? COLORS.success : COLORS.primary },
    { label: "Konversiya", value: income.conversionRate.toFixed(1) + "%", icon: TrendingUp, tone: income.conversionRate > 5 ? COLORS.success : income.conversionRate >= 3 ? "#F5B301" : COLORS.danger },
    { label: "O'z vaqtida kelgan kunlar", value: `${income.onTimeDays}/${income.totalDays}`, icon: CheckCircle2, tone: COLORS.primary },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon size={18} style={{ color: s.tone }} className="mb-2" />
            <p className="text-xs" style={{ color: COLORS.sub }}>{s.label}</p>
            <p className="font-bold text-base sm:text-lg mt-0.5" style={{ color: COLORS.ink }}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Shaxsiy oylik reja</h3>
            <Pill tone={pct >= 100 ? "success" : "primary"}>{pct.toFixed(0)}%</Pill>
          </div>
          <ProgressBar percent={pct} />
          <div className="flex justify-between mt-2 text-xs" style={{ color: COLORS.sub }}>
            <span>{fmt(operator.sold)} so'm</span>
            <span>Reja: {fmt(operator.monthlyPlan)} so'm</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl p-3" style={{ background: "#F9FAFB" }}>
              <p className="text-xs mb-1" style={{ color: COLORS.sub }}>Bugungi natija</p>
              <p className="font-bold text-base" style={{ color: COLORS.ink }}>{fmt(soldToday)} so'm</p>
              <p className="text-[11px] mt-0.5" style={{ color: dayPct >= 100 ? COLORS.success : COLORS.sub }}>
                Kunlik reja: {fmt(dailyPlan)} ({dayPct.toFixed(0)}%)
              </p>
            </div>
            <div className="rounded-xl p-3" style={{ background: COLORS.primaryLight }}>
              <p className="text-xs mb-1" style={{ color: COLORS.primary }}>Oy oxiri prognozi</p>
              <p className="font-bold text-base" style={{ color: COLORS.primary }}>{fmt(forecast)} so'm</p>
              <p className="text-[11px] mt-0.5" style={{ color: forecastPct >= 100 ? COLORS.success : COLORS.danger }}>
                {forecastPct.toFixed(0)}% bajarilishi kutilmoqda
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t" style={{ borderColor: COLORS.border }}>
            <p className="text-xs font-semibold mb-2" style={{ color: COLORS.sub }}>Sotuv bonus bosqichlari</p>
            <div className="grid grid-cols-3 gap-2">
              {BONUS_TIERS.map((t, i) => (
                <div
                  key={t.label}
                  className="text-center rounded-lg py-1.5 text-xs font-semibold"
                  style={{
                    background: i === activeTierIndex ? COLORS.primaryLight : "#F9FAFB",
                    color: i === activeTierIndex ? COLORS.primary : COLORS.sub,
                  }}
                >
                  {t.label}<br />{(t.rate * 100).toFixed(0)}%
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: COLORS.ink }}>Umumiy daromad tarkibi</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span style={{ color: COLORS.sub }}>Fiksa baza</span>
              <span className="font-semibold" style={{ color: COLORS.ink }}>{fmt(income.base)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.sub }} className="flex items-center gap-1">
                <Clock size={12} /> Davomat ({income.onTimeDays} kun)
              </span>
              <span className="font-semibold" style={{ color: COLORS.primary }}>{fmt(income.attendanceBonus)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.sub }}>Ish soati bonusi</span>
              <span className="font-semibold" style={{ color: COLORS.primary }}>{fmt(income.hoursBonus)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.sub }}>Sotuv bonusi ({(operator.bonusRate * 100).toFixed(0)}%)</span>
              <span className="font-semibold" style={{ color: COLORS.gold }}>{fmt(income.salesBonus)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: COLORS.sub }} className="flex items-center gap-1">
                <TrendingUp size={12} /> Konversiya bonusi
              </span>
              <span className="font-semibold" style={{ color: COLORS.success }}>{fmt(income.convBonus)}</span>
            </div>
            <div className="h-px my-1" style={{ background: COLORS.border }} />
            <div className="flex justify-between">
              <span className="font-semibold" style={{ color: COLORS.ink }}>Jami</span>
              <span className="font-extrabold text-base" style={{ color: COLORS.success }}>{fmt(income.total)} so'm</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t text-[11px] space-y-1" style={{ borderColor: COLORS.border, color: COLORS.sub }}>
            <p>• Davomat: har kuni {operator.team === "Kechki" ? "13:50-14:10" : "09:50-10:10"} check-in uchun +40,000 so'm</p>
            <p>• 5+ soat ishlasangiz +27,000, 4-5 soat +18,000 so'm/kun</p>
            <p>• Konversiya &gt;5% uchun +500,000, 3-5% uchun +200,000 so'm</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
