"use client";

import { useState } from "react";
import { COLORS } from "@/lib/constants";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function InvoiceEditForm({ invoice, operators, onSave, onCancel }) {
  const [form, setForm] = useState({
    clientName: invoice.clientName,
    phone: invoice.phone,
    amount: invoice.amount,
    saleDate: invoice.date,
    status: invoice.status,
    operatorId: invoice.operatorId,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <label className="block">
        <span className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>Sotuvchi</span>
        <select value={form.operatorId} onChange={(e) => update("operatorId", e.target.value)} className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: COLORS.border }}>
          {operators.map((op) => (
            <option key={op.id} value={op.id}>{op.firstName} {op.lastName}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Mijoz ismi" value={form.clientName} onChange={(e) => update("clientName", e.target.value)} />
        <Input label="Telefon" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Summa (so'm)" type="number" value={form.amount} onChange={(e) => update("amount", e.target.value)} />
        <Input label="Sana" type="date" value={form.saleDate} onChange={(e) => update("saleDate", e.target.value)} />
      </div>

      <label className="block">
        <span className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>Status</span>
        <select value={form.status} onChange={(e) => update("status", e.target.value)} className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: COLORS.border }}>
          <option value="Kutilmoqda">Kutilmoqda</option>
          <option value="Tasdiqlangan">Tasdiqlangan</option>
        </select>
      </label>

      {error && <p className="text-sm font-medium" style={{ color: COLORS.danger }}>{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1" disabled={saving}>Bekor qilish</Button>
      </div>
    </form>
  );
}
