"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import styles from "./admin-alerts.module.css";

const VAPID_PUBLIC_KEY = "BCu-RuCf1vdiAr6eUOnZRKYTaBTqAdmknc0LtfXQO1kH4IGBM6lcw3VlwN2D26cTWPo2Iei7SyQUcLeWiR5cGXA";

type Counts = {
  leads: number;
  services: number;
  dealers: number;
  partners: number;
  verification: number;
  dealerVehicles: number;
};

const emptyCounts: Counts = { leads: 0, services: 0, dealers: 0, partners: 0, verification: 0, dealerVehicles: 0 };

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)));
}

export default function AdminPending() {
  const db = supabase();
  const [visible, setVisible] = useState(false);
  const [counts, setCounts] = useState<Counts>(emptyCounts);
  const [pushState, setPushState] = useState<"checking" | "enabled" | "off" | "unsupported" | "working">("checking");
  const [notice, setNotice] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadCounts() {
    const [leadQ, serviceQ, dealerQ, partnerQ, verifyQ, dealerVehicleQ] = await Promise.all([
      db.from("leads").select("id", { count: "exact", head: true }).in("status", ["new", "contacted", "qualified"]),
      db.from("service_requests").select("id", { count: "exact", head: true }).in("status", ["new", "assigned", "accepted", "in_progress"]),
      db.from("dealer_applications").select("id", { count: "exact", head: true }).in("status", ["new", "reviewing"]),
      db.from("collaboration_requests").select("id", { count: "exact", head: true }).in("status", ["new", "reviewing"]),
      db.from("vehicle_verification_orders").select("id", { count: "exact", head: true }).in("status", ["submitted", "pending", "in_progress"]),
      db.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "draft").not("partner_id", "is", null),
    ]);
    setCounts({
      leads: leadQ.count ?? 0,
      services: serviceQ.count ?? 0,
      dealers: dealerQ.count ?? 0,
      partners: partnerQ.count ?? 0,
      verification: verifyQ.count ?? 0,
      dealerVehicles: dealerVehicleQ.count ?? 0,
    });
  }

  async function checkPush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setPushState("unsupported");
      return;
    }
    if (Notification.permission !== "granted") {
      setPushState("off");
      return;
    }
    const registration = await navigator.serviceWorker.register("/rohilla-sw.js");
    const subscription = await registration.pushManager.getSubscription();
    setPushState(subscription ? "enabled" : "off");
  }

  useEffect(() => {
    let cancelled = false;
    let gateTimer: ReturnType<typeof setTimeout> | null = null;

    async function gate() {
      const { data: { session } } = await db.auth.getSession();
      if (!session || cancelled) return;
      const { data: aal } = await db.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel !== "aal2") {
        gateTimer = setTimeout(gate, 2500);
        return;
      }
      if (cancelled) return;
      setVisible(true);
      await Promise.all([loadCounts(), checkPush()]);
      timerRef.current = setInterval(loadCounts, 30000);
    }

    gate();
    return () => {
      cancelled = true;
      if (gateTimer) clearTimeout(gateTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const total = useMemo(() => Object.values(counts).reduce((sum, value) => sum + value, 0), [counts]);

  async function enablePhoneAlerts() {
    setNotice("");
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setPushState("unsupported");
      setNotice("This browser does not support phone push notifications.");
      return;
    }
    setPushState("working");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setPushState("off");
      setNotice("Notification permission was not allowed. Enable it in browser Site settings and try again.");
      return;
    }

    const registration = await navigator.serviceWorker.register("/rohilla-sw.js");
    await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const { data: { session } } = await db.auth.getSession();
    if (!session) {
      setPushState("off");
      setNotice("Admin session expired. Please log in again.");
      return;
    }
    const json = subscription.toJSON();
    const endpoint = json.endpoint;
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;
    if (!endpoint || !p256dh || !auth) {
      setPushState("off");
      setNotice("Could not create a valid phone notification subscription.");
      return;
    }

    const { error } = await db.from("admin_push_subscriptions").upsert({
      admin_user_id: session.user.id,
      endpoint,
      p256dh,
      auth,
      user_agent: navigator.userAgent,
      updated_at: new Date().toISOString(),
    }, { onConflict: "endpoint" });

    if (error) {
      setPushState("off");
      setNotice(error.message);
      return;
    }

    setPushState("enabled");
    setNotice("Phone alerts enabled. Sending a test notification…");
    const test = await db.rpc("test_rohilla_admin_push");
    setNotice(test.error ? `Alerts enabled, but test failed: ${test.error.message}` : "Phone alerts enabled ✓ Test notification sent.");
  }

  if (!visible) return null;

  const items = [
    ["Sales / Listings", counts.leads, "#customer-leads"],
    ["Services", counts.services, "#service-requests"],
    ["Dealer Apps", counts.dealers, "#dealer-applications"],
    ["Partner Apps", counts.partners, "#partner-applications"],
    ["Verification", counts.verification, "/admin/verification"],
    ["Dealer Vehicles", counts.dealerVehicles, "#inventory"],
  ] as const;

  return <section className={styles.wrap} aria-label="Admin pending tasks">
    <div className={styles.topline}>
      <div>
        <span className={styles.eyebrow}>CONTROL ROOM</span>
        <h2><strong>{total}</strong> Pending Tasks</h2>
        <p>New enquiries and applications stay saved here even if the customer does not send the WhatsApp message.</p>
      </div>
      <div className={styles.alertBox}>
        <span className={pushState === "enabled" ? styles.liveDot : styles.offDot} />
        <b>{pushState === "enabled" ? "Phone Alerts ON" : pushState === "working" ? "Enabling…" : "Phone Alerts OFF"}</b>
        {pushState !== "enabled" && pushState !== "working" && <button onClick={enablePhoneAlerts}>Enable on this phone</button>}
        {pushState === "enabled" && <button onClick={enablePhoneAlerts}>Send Test</button>}
      </div>
    </div>
    <div className={styles.grid}>
      {items.map(([label, value, href]) => <a key={label} href={href} className={value > 0 ? styles.pending : styles.clear}>
        <strong>{value}</strong><span>{label}</span>
      </a>)}
    </div>
    {notice && <p className={styles.notice}>{notice}</p>}
  </section>;
}
