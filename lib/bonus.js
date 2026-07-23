// Bosqichli bonus foizi — butun oylik summaga qarab.
// 0-10 mln: 4%, 10-20 mln: 7%, 20 mln dan yuqori: 10%.
export function getBonusRate(monthlySold) {
  if (monthlySold >= 20000000) return 0.10;
  if (monthlySold >= 10000000) return 0.07;
  return 0.04;
}

export function calculateBonus(monthlySold) {
  const rate = getBonusRate(monthlySold);
  return Math.round(monthlySold * rate);
}

export const BONUS_TIERS = [
  { label: "0 – 10 mln", rate: 0.04 },
  { label: "10 – 20 mln", rate: 0.07 },
  { label: "20 mln+", rate: 0.10 },
];
