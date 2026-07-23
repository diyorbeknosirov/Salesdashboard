"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Check } from "lucide-react";
import { COLORS } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const STAGE_FIELDS = [
  { key: "prioritet", label: "Prioritet" },
  { key: "aloqa_ornatildi", label: "Aloqa o'rnatildi" },
  { key: "qayta_aloqa", label: "Qayta aloqa" },
  { key: "malumot_berildi", label: "Ma'lumot berildi" },
  { key: "tolovga_rozi", label: "To'lovga rozi" },
  { key: "birinchi_tolov", label: "Birinchi to'lov" },
  { key: "sotuv", label: "Sotuv" },
];

const REJECTION_FIELDS = [
  { key: "otkaz_qimmat", label: "Qimmat" },
  { key: "otkaz_adashgan", label: "Adashib o'tgan / xato kontakt" },
  { key: "otkaz_nedozvon", label: "Nedozvon" },
  { key: "otkaz_kerak_emas", label: "Kerak emas" },
  { key: "otkaz_hozir_emas", label: "Hozir emas" },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm() {
  const base = {};
  [...STAGE_FIELDS, ...REJECTION_FIELDS].forEach((f) => { base[f.key] = 0; });
  return base;
}

export default function LeadStatsForm({ user, stats, onSave }) {
  const todayRow = stats.find((s) => s.operator_id === user.id && s.stat_date === todayStr());
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (todayRow) {
      const next = emptyForm();
      Object.keys(next).forEach((k) => { next[k] = todayRow[k] ?? 0; });
      setForm(next);
    }
  }, [todayRow?.id]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: Math.max(0, Number(v) || 0) }));

  const totalRejections = REJECTION_FIELDS.reduce((s, f) => s + (form[f.key] || 0), 0);
  const totalLeads = STAGE_FIELDS.reduce((s, f) => s + (form[f.key] || 0), 0) + totalRejections;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList size={18} style={{ color: COLORS.primary }} />
        <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>Bugungi lid statistikasi</h3>
      </div>

      {saved && (
        <div className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold" style={{ background: COLORS.successBg, color: COLORS.success }}>
          <Check size={14} /> Saqlandi
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: COLORS.sub }}>Lid bosqichlari</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STAGE_FIELDS.map((f) => (
              <label key={f.key} className="block">
                <span className="block text-xs mb-1" style={{ color: COLORS.sub }}>{f.label}</span>
                <input
                  type="number"
                  min="0"
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none"
                  style={{ borderColor: COLORS.border }}
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: COLORS.danger }}>Otkaz sabablari</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {REJECTION_FIELDS.map((f) => (
              <label key={f.key} className="block">
                <span className="block text-xs mb-1" style={{ color: COLORS.sub }}>{f.label}</span>
                <input
                  type="number"
                  min="0"
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none"
                  style={{ borderColor: COLORS.border }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ background: COLORS.primaryLight }}>
            <p className="text-xs" style={{ color: COLORS.primary }}>Umumiy lid (avtomatik)</p>
            <p className="font-bold text-lg" style={{ color: COLORS.primary }}>{totalLeads}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: COLORS.dangerBg }}>
            <p className="text-xs" style={{ color: COLORS.danger }}>Umumiy otkaz (avtomatik)</p>
            <p className="font-bold text-lg" style={{ color: COLORS.danger }}>{totalRejections}</p>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </form>
    </Card>
  );
}
