"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Plus, Users, CircleDollarSign, Calendar, FileText, LogOut, UserCog, ListTodo, BarChart3, Clock, Crown } from "lucide-react";
import { COLORS } from "@/lib/constants";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";

const OPERATOR_NAV = [
  { href: "/dashboard", label: "Bosh sahifa", icon: LayoutGrid },
  { href: "/dashboard/new-sale", label: "Yangi sotuv", icon: Plus },
  { href: "/dashboard/report", label: "Hisobot", icon: BarChart3 },
  { href: "/dashboard/tasks", label: "Tasklar", icon: ListTodo },
  { href: "/dashboard/profile", label: "Profil sozlamalari", icon: UserCog },
];

const ADMIN_NAV = [
  { href: "/dashboard", label: "Bosh sahifa", icon: LayoutGrid },
  { href: "/dashboard/new-sale", label: "Yangi sotuv", icon: Plus },
  { href: "/dashboard/admin/operators", label: "Sotuvchilar", icon: Users },
  { href: "/dashboard/admin/finance", label: "Moliya va Plan", icon: CircleDollarSign },
  { href: "/dashboard/admin/calendar", label: "Kalendar / Arxiv", icon: Calendar },
  { href: "/dashboard/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard/admin/analytics", label: "Analitika", icon: BarChart3 },
  { href: "/dashboard/admin/attendance", label: "Davomat / Hisobot", icon: Clock },
  { href: "/dashboard/admin/tasks", label: "Tasklar", icon: ListTodo },
  { href: "/dashboard/profile", label: "Profil sozlamalari", icon: UserCog },
];

const TEAM_LEADER_NAV = [
  { href: "/dashboard/team/operators", label: "Jamoa a'zolari", icon: Crown },
  { href: "/dashboard/team/tasks", label: "Jamoaga task", icon: ListTodo },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;
  const baseItems = user.role === "admin" ? ADMIN_NAV : OPERATOR_NAV;
  const items = user.isTeamLeader && user.role !== "admin"
    ? [...baseItems.slice(0, -1), ...TEAM_LEADER_NAV, baseItems[baseItems.length - 1]]
    : baseItems;

  const go = (href) => {
    router.push(href);
    setMobileOpen(false);
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-white border-r z-50 flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ borderColor: COLORS.border }}
      >
        <div className="px-5 py-5 flex items-center gap-2.5 border-b" style={{ borderColor: COLORS.border }}>
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0" style={{ background: COLORS.primary }}>
            <img src="/deepai-logo.jpg" alt="Deep AI" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-extrabold text-sm" style={{ color: COLORS.ink }}>Sales Dashboard</p>
            <p className="text-[11px]" style={{ color: COLORS.sub }}>Deep Ai sotuv jamoasi</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <button
                key={it.href}
                onClick={() => go(it.href)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: active ? COLORS.primaryLight : "transparent", color: active ? COLORS.primary : COLORS.sub }}
              >
                <it.icon size={17} />
                {it.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: COLORS.border }}>
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1.5">
            <Avatar initials={user.avatar} src={user.avatarImage} size={34} />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: COLORS.ink }}>
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px]" style={{ color: COLORS.sub }}>
                {user.role === "admin" ? "Administrator" : user.isTeamLeader ? "Jamoa rahbari" : "Sotuvchi"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ color: COLORS.danger, background: COLORS.dangerBg }}
          >
            <LogOut size={16} /> Chiqish
          </button>
        </div>
      </aside>
    </>
  );
}
