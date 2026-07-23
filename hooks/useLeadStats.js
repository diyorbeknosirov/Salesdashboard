"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function monthStart() {
  return todayStr().slice(0, 7) + "-01";
}

/**
 * Joriy oy uchun daily_lead_stats qatorlarini oladi.
 * Admin — barcha operatorlarniki, operator — faqat o'ziniki.
 */
export function useLeadStats(user) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setStats([]);
      setLoading(false);
      return;
    }
    let query = supabase.from("daily_lead_stats").select("*").gte("stat_date", monthStart());
    if (user.role !== "admin") {
      query = query.eq("operator_id", user.id);
    }
    const { data, error } = await query;
    if (!error) setStats(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`lead-stats-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_lead_stats" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, load]);

  const upsertToday = useCallback(async (operatorId, patch) => {
    const { error } = await supabase.from("daily_lead_stats").upsert(
      {
        operator_id: operatorId,
        stat_date: todayStr(),
        ...patch,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "operator_id,stat_date" }
    );
    if (error) throw error;
    await load();
  }, [load]);

  return { stats, loading, upsertToday, refresh: load };
}
