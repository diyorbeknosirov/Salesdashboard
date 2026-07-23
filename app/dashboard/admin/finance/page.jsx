"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import FinancePlan from "@/components/admin/FinancePlan";

export default function AdminFinancePage() {
  const { user } = useAuth();
  const { operators, teamPlan } = useData();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;
  return <FinancePlan operators={operators} teamPlan={teamPlan} />;
}
