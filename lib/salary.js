// Fiksa oylikni 3 qismga bo'lish + konversiya bonusi hisoblash mantiqi.

export const ATTENDANCE_BONUS_PER_DAY = 40000;
export const HOURS_BONUS_5_PLUS = 27000;
export const HOURS_BONUS_4_TO_5 = 18000;
export const CONVERSION_BONUS_HIGH = 500000; // >5%
export const CONVERSION_BONUS_MID = 200000;  // 3-5%

const DAY_TEAM_WINDOW = { start: 9 * 60 + 50, end: 10 * 60 + 10 };   // Kunduzgi: 09:50-10:10
const EVENING_TEAM_WINDOW = { start: 13 * 60 + 50, end: 14 * 60 + 10 }; // Kechki: 13:50-14:10

export function isCheckInOnTime(startedAt, team) {
  if (!startedAt) return false;
  const d = new Date(startedAt);
  const minutes = d.getHours() * 60 + d.getMinutes();
  const window = team === "Kechki" ? EVENING_TEAM_WINDOW : DAY_TEAM_WINDOW;
  return minutes >= window.start && minutes <= window.end;
}

export function hoursBonusForDay(activeSeconds) {
  const hours = (Number(activeSeconds) || 0) / 3600;
  if (hours >= 5) return HOURS_BONUS_5_PLUS;
  if (hours >= 4) return HOURS_BONUS_4_TO_5;
  return 0;
}

export function conversionBonus(conversionRatePercent) {
  if (conversionRatePercent > 5) return CONVERSION_BONUS_HIGH;
  if (conversionRatePercent >= 3) return CONVERSION_BONUS_MID;
  return 0;
}

// Bir oylik work_sessions qatorlaridan davomat va soat bonuslarini hisoblaydi.
export function computeMonthlyExtras(workSessions, team) {
  let attendanceBonus = 0;
  let hoursBonus = 0;
  let onTimeDays = 0;
  (workSessions || []).forEach((s) => {
    if (isCheckInOnTime(s.started_at, team)) {
      attendanceBonus += ATTENDANCE_BONUS_PER_DAY;
      onTimeDays += 1;
    }
    hoursBonus += hoursBonusForDay(s.active_seconds);
  });
  return { attendanceBonus, hoursBonus, onTimeDays, totalDays: (workSessions || []).length };
}

// Lid statistikasi qatorlaridan umumiy lid, sotuv va konversiyani hisoblaydi.
export function computeLeadTotals(leadStats) {
  let stageLeads = 0;
  let totalSales = 0;
  let totalRejections = 0;
  (leadStats || []).forEach((r) => {
    stageLeads += (r.prioritet || 0) + (r.aloqa_ornatildi || 0) + (r.qayta_aloqa || 0)
      + (r.malumot_berildi || 0) + (r.tolovga_rozi || 0) + (r.birinchi_tolov || 0) + (r.sotuv || 0);
    totalSales += r.sotuv || 0;
    totalRejections += (r.otkaz_qimmat || 0) + (r.otkaz_adashgan || 0) + (r.otkaz_nedozvon || 0)
      + (r.otkaz_kerak_emas || 0) + (r.otkaz_hozir_emas || 0);
  });
  // Umumiy lid — bosqich lidlari + otkaz qilinganlar (otkaz ham lid hisoblanadi).
  const totalLeads = stageLeads + totalRejections;
  const conversionRate = totalLeads ? (totalSales / totalLeads) * 100 : 0;
  return { totalLeads, totalSales, totalRejections, conversionRate };
}

// Operator uchun to'liq oylik daromadni hisoblaydi:
// fiksa baza + davomat bonusi + soat bonusi + sotuv bonusi (mavjud) + konversiya bonusi.
export function computeTotalIncome(operator, workSessions, leadStats) {
  const { attendanceBonus, hoursBonus, onTimeDays, totalDays } = computeMonthlyExtras(workSessions, operator.team);
  const { conversionRate, totalLeads, totalSales, totalRejections } = computeLeadTotals(leadStats);
  const salesBonus = operator.bonus ?? 0;
  const convBonus = conversionBonus(conversionRate);
  const total = (operator.fixedSalary || 0) + attendanceBonus + hoursBonus + salesBonus + convBonus;

  return {
    base: operator.fixedSalary || 0,
    attendanceBonus,
    hoursBonus,
    salesBonus,
    convBonus,
    total,
    onTimeDays,
    totalDays,
    conversionRate,
    totalLeads,
    totalSales,
    totalRejections,
  };
}
