"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useLiveSaleToasts } from "@/hooks/useLiveSaleToasts";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import CelebrationOverlay from "@/components/layout/CelebrationOverlay";
import WorkTimerBar from "@/components/layout/WorkTimerBar";
import MotivationBanner from "@/components/dashboard/MotivationBanner";

export default function DashboardLayout({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { operators, tariffs, newSaleEvent } = useData();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { current, dismissCurrent } = useLiveSaleToasts(newSaleEvent, operators, tariffs);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "#FBFBFD" }}>
        <p className="text-sm text-gray-400">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!user) return null;

  const isOperator = user.role === "operator";

  return (
    <div className="min-h-screen w-full flex" style={{ background: "#FBFBFD" }}>
      <CelebrationOverlay event={current} onDismiss={dismissCurrent} />
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className={`flex-1 min-w-0 p-4 sm:p-6 lg:p-8 ${isOperator ? "pb-20" : ""}`}>
        <Topbar setMobileOpen={setMobileOpen} />
        <MotivationBanner />
        {children}
      </main>
      <WorkTimerBar user={user} />
    </div>
  );
}
