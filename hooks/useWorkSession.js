"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const IDLE_LIMIT_MS = 30 * 60 * 1000;   // 30 daqiqa harakatsizlik — avtomatik pauza
const SYNC_INTERVAL_MS = 20000;          // 20 soniyada bir DB'ga yozish
const IDLE_CHECK_INTERVAL_MS = 30000;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function useWorkSession(user) {
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("stopped"); // running | paused | stopped
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [autoPaused, setAutoPaused] = useState(false);
  const [ready, setReady] = useState(false);

  const lastActivityRef = useRef(Date.now());
  const elapsedRef = useRef(0);

  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  const persist = useCallback(async (newStatus) => {
    if (!sessionId) return;
    await supabase
      .from("work_sessions")
      .update({
        active_seconds: Math.round(elapsedRef.current),
        status: newStatus,
        last_ping_at: new Date().toISOString(),
      })
      .eq("id", sessionId);
  }, [sessionId]);

  // Bugungi sessiyani topish yoki yaratish
  useEffect(() => {
    if (!user || user.role !== "operator") return;
    let cancelled = false;

    (async () => {
      const today = todayStr();
      const { data: existing } = await supabase
        .from("work_sessions")
        .select("*")
        .eq("operator_id", user.id)
        .eq("work_date", today)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (existing) {
        setSessionId(existing.id);
        setElapsedSeconds(Number(existing.active_seconds) || 0);
        setStatus(existing.status === "stopped" ? "paused" : existing.status);
      } else {
        const { data: created } = await supabase
          .from("work_sessions")
          .insert({ operator_id: user.id, work_date: today, status: "running", active_seconds: 0 })
          .select()
          .single();
        if (created && !cancelled) {
          setSessionId(created.id);
          setElapsedSeconds(0);
          setStatus("running");
        }
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Foydalanuvchi faolligini kuzatish
  useEffect(() => {
    const markActive = () => {
      lastActivityRef.current = Date.now();
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, markActive));
    return () => events.forEach((ev) => window.removeEventListener(ev, markActive));
  }, []);

  // Har soniyada hisoblagich (faqat "running" holatda)
  useEffect(() => {
    if (status !== "running") return;
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Bo'sh turishni tekshirish
  useEffect(() => {
    if (status !== "running") return;
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > IDLE_LIMIT_MS) {
        setStatus("paused");
        setAutoPaused(true);
        persist("paused");
      }
    }, IDLE_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status, persist]);

  // Davriy sinxronlash
  useEffect(() => {
    if (status !== "running") return;
    const interval = setInterval(() => persist("running"), SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status, persist]);

  const pause = useCallback(() => {
    setStatus("paused");
    setAutoPaused(false);
    persist("paused");
  }, [persist]);

  const resume = useCallback(() => {
    lastActivityRef.current = Date.now();
    setStatus("running");
    setAutoPaused(false);
    persist("running");
  }, [persist]);

  return { status, elapsedSeconds, autoPaused, ready, pause, resume };
}
