"use client";

import { BarChart3 } from "lucide-react";
import { COLORS } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Pill from "@/components/ui/Pill";

const STAGE_FIELDS = [
  { key: "prioritet", label: "Prioritet" },
  { key: "aloqa_ornatildi", label: "Aloqa" },
  { key: "qayta_aloqa", label: "Qayta aloqa" },
  { key: "malumot_berildi", label: "Ma'lumot" },
  { key: "tolovga_rozi", label: "To'lovga rozi" },
  { key: "birinchi_tolov", label: "1-to'lov" },
  { key: "sotuv", label: "Sotuv" },
];

const REJECTION_FIELDS = [
  { key: "otkaz_qimmat", label: "Qimmat" },
  { key: "otkaz_adashgan", label: "Adashgan" },
  { key: "otkaz_nedozvon", label: "Nedozvon" },
  { key: "otkaz_kerak_emas", label: "Kerak emas" },
  { key: "otkaz_hozir_emas", label: "Hozir emas" },
];

export default function AnalyticsTable({ operators, leadStats }) {
  const rows = operators.map((op) => {
    const opStats = leadStats.filter((l) => l.operator_id === op.id);
    const sums = {};
    [...STAGE_FIELDS, ...REJECTION_FIELDS].forEach((f) => {
      sums[f.key] = opStats.reduce((s, r) => s + (r[f.key] || 0), 0);
    });
    const totalRejections = REJECTION_FIELDS.reduce((s, f) => s + sums[f.key], 0);
    const totalLeads = STAGE_FIELDS.reduce((s, f) => s + sums[f.key], 0) + totalRejections;
    const conversion = totalLeads ? (sums.sotuv / totalLeads) * 100 : 0;
    return { op, sums, totalLeads, totalRejections, conversion };
  });

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} style={{ color: COLORS.primary }} />
        <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Analitika (joriy oy)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1150px]">
          <thead>
            <tr className="text-left" style={{ color: COLORS.sub }}>
              <th className="py-2 px-1 font-medium sticky left-0 bg-white">Xodim</th>
              {STAGE_FIELDS.map((f) => <th key={f.key} className="py-2 px-1 font-medium whitespace-nowrap">{f.label}</th>)}
              <th className="py-2 px-1 font-medium whitespace-nowrap">Umumiy lid</th>
              {REJECTION_FIELDS.map((f) => <th key={f.key} className="py-2 px-1 font-medium whitespace-nowrap">{f.label}</th>)}
              <th className="py-2 px-1 font-medium whitespace-nowrap">Umumiy otkaz</th>
              <th className="py-2 px-1 font-medium whitespace-nowrap">Konversiya</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ op, sums, totalLeads, totalRejections, conversion }) => (
              <tr key={op.id} className="border-t" style={{ borderColor: COLORS.border }}>
                <td className="py-2.5 px-1 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <Avatar initials={op.avatar} src={op.avatarImage} size={26} />
                    <span className="font-semibold whitespace-nowrap" style={{ color: COLORS.ink }}>{op.firstName} {op.lastName}</span>
                  </div>
                </td>
                {STAGE_FIELDS.map((f) => (
                  <td key={f.key} className="py-2.5 px-1 text-center" style={{ color: COLORS.sub }}>{sums[f.key]}</td>
                ))}
                <td className="py-2.5 px-1 text-center font-bold" style={{ color: COLORS.primary }}>{totalLeads}</td>
                {REJECTION_FIELDS.map((f) => (
                  <td key={f.key} className="py-2.5 px-1 text-center" style={{ color: COLORS.sub }}>{sums[f.key]}</td>
                ))}
                <td className="py-2.5 px-1 text-center font-bold" style={{ color: COLORS.danger }}>{totalRejections}</td>
                <td className="py-2.5 px-1 text-center">
                  <Pill tone={conversion > 5 ? "success" : conversion >= 3 ? "default" : "danger"}>{conversion.toFixed(1)}%</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs mt-3" style={{ color: COLORS.sub }}>
        * "Umumiy lid" va "Umumiy otkaz" ustunlari qo'lda tahrirlanmaydi — ular yuqoridagi
        bosqich/sabab ustunlarining avtomatik yig'indisi.
      </p>
    </Card>
  );
}
