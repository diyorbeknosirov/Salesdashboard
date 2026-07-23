"use client";

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useCallLogs } from "@/hooks/useCallLogs";
import { useLeadStats } from "@/hooks/useLeadStats";
import { useMonthlyWorkSessions } from "@/hooks/useMonthlyWorkSessions";
import CallLogForm from "@/components/dashboard/CallLogForm";
import LeadStatsForm from "@/components/dashboard/LeadStatsForm";
import ReportCharts from "@/components/dashboard/ReportCharts";
import AttendanceCalendar from "@/components/dashboard/AttendanceCalendar";

export default function ReportPage() {
  const { user } = useAuth();
  const { invoices, operators } = useData();
  const { logs, addCallLog } = useCallLogs(user?.id);
  const { stats: leadStats, upsertToday } = useLeadStats(user);
  const { sessions: workSessions } = useMonthlyWorkSessions(user);

  if (!user) return null;

  const saveLeadStats = (patch) => upsertToday(user.id, patch);
  const myOperator = operators.find((o) => o.id === user.id);
  const myWorkSessions = workSessions.filter((s) => s.operator_id === user.id);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <CallLogForm onAdd={addCallLog} />
          <AttendanceCalendar operator={myOperator} workSessions={myWorkSessions} />
        </div>
        <div className="lg:col-span-2">
          <LeadStatsForm user={user} stats={leadStats} onSave={saveLeadStats} />
        </div>
      </div>
      <ReportCharts invoices={invoices} callLogs={logs} leadStats={leadStats} operatorId={user.id} />
    </div>
  );
}
