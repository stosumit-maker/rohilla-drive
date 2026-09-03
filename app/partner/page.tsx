"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

type Request = {
  id: string;
  customer_name: string;
  customer_phone: string;
  category: string;
  vehicle_location: string | null;
  customer_location: string | null;
  details: string | null;
  preferred_time: string | null;
  status: string;
  created_at: string;
  vehicle?: {
    brand: string;
    model: string;
    variant: string | null;
    year: number | null;
  } | null;
};

const statuses = [
  "new",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
];

export default function PartnerPage() {
  const db = supabase();

  const [session, setSession] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    start();
  }, []);

  async function start() {
    setLoading(true);

    const {
      data: { session },
    } = await db.auth.getSession();

    if (!session) {
      setLoading(false);
      return;
    }

    setSession(session);

    const { data: profile } = await db
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setPartner(profile);

    if (profile?.role !== "partner") {
      setLoading(false);
      setMessage("This account is not registered as a service provider.");
      return;
    }

    await loadRequests(session.user.id);
    setLoading(false);
  }

  async function loadRequests(userId = session?.user?.id) {
    if (!userId) return;

    const { data, error } = await db
      .from("service_requests")
      .select(
        `
        id,
        customer_name,
        customer_phone,
        category,
        vehicle_location,
        customer_location,
        details,
        preferred_time,
        status,
        created_at,
        vehicle:vehicles(
          brand,
          model,
          variant,
          year
        )
        `
      )
      .eq("assigned_partner_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setRequests(
      (data || []).map((item: any) => ({
        ...item,
        vehicle: Array.isArray(item.vehicle)
          ? item.vehicle[0] || null
          : item.vehicle,
      }))
    );
  }

  async function updateStatus(id: string, status: string) {
    setMessage("");

    const { error } = await db
      .from("service_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("assigned_partner_id", session.user.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRequests((old) =>
      old.map((r) => (r.id === id ? { ...r, status } : r))
    );

    setMessage("Request status updated.");
  }

  async function logout() {
    await db.auth.signOut();
    setSession(null);
    setPartner(null);
    setRequests([]);
  }

  function callCustomer(phone: string) {
    window.location.href = `tel:${phone}`;
  }

  function whatsappCustomer(request: Request) {
    const text = `ROHILLA DRIVE SERVICE UPDATE

Customer: ${request.customer_name}
Service: ${request.category}
Request ID: ${request.id}

I am contacting you regarding your service request.`;

    window.open(
      `https://wa.me/${phoneClean(request.customer_phone)}?text=${encodeURIComponent(
        text
      )}`,
      "_blank"
    );
  }

  function phoneClean(phone: string) {
    const clean = phone.replace(/\D/g, "");

    if (clean.startsWith("91")) return clean;

    return `91${clean}`;
  }

  const filtered =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status === filter);

  if (loading) {
    return (
      <main className="section">
        <h2>Loading Service Partner Portal…</h2>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="section">
        <div className="auth-card">
          <h1>ROHILLA DRIVE</h1>
          <p>Service Provider Portal</p>

          <button
            className="primary"
            onClick={() => {
              window.location.href = "/admin";
            }}
          >
            Partner Login
          </button>

          <p className="muted">
            Please sign in with your approved service provider account.
          </p>
        </div>
      </main>
    );
  }

  if (partner?.role !== "partner") {
    return (
      <main className="section">
        <div className="auth-card">
          <h1>Access Restricted</h1>
          <p>{message}</p>

          <button className="primary" onClick={logout}>
            Sign Out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <header>
        <div className="brand">
          <b>ROHILLA DRIVE</b>
          <small>Service Provider Portal</small>
        </div>

        <button className="call" onClick={logout}>
          Sign Out
        </button>
      </header>

      <section className="section">
        <div className="partner-head">
          <div>
            <label>SERVICE PROVIDER</label>

            <h1>
              Welcome{partner?.name ? `, ${partner.name}` : ""}
            </h1>

            <p>
              Manage your assigned customer service requests from one place.
            </p>
          </div>

          <button
            className="secondary"
            onClick={() => loadRequests(session.user.id)}
          >
            Refresh
          </button>
        </div>

        {message && (
          <div className="notice">
            {message}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <strong>{requests.length}</strong>
            <span>Total Requests</span>
          </div>

          <div className="stat-card">
            <strong>
              {requests.filter((r) => r.status === "new").length}
            </strong>
            <span>New</span>
          </div>

          <div className="stat-card">
            <strong>
              {
                requests.filter(
                  (r) => r.status === "accepted" || r.status === "in_progress"
                ).length
              }
            </strong>
            <span>Active</span>
          </div>

          <div className="stat-card">
            <strong>
              {requests.filter((r) => r.status === "completed").length}
            </strong>
            <span>Completed</span>
          </div>
        </div>

        <div className="filter-row">
          {["all", ...statuses].map((item) => (
            <button
              key={item}
              className={filter === item ? "filter active" : "filter"}
              onClick={() => setFilter(item)}
            >
              {item === "all"
                ? "All"
                : item.replace("_", " ").replace(/\b\w/g, (x) =>
                    x.toUpperCase()
                  )}
            </button>
          ))}
        </div>

        <div className="request-list">
          {filtered.length === 0 ? (
            <div className="empty-card">
              <h2>No assigned requests</h2>
              <p>
                New requests assigned by Rohilla Drive will appear here.
              </p>
            </div>
          ) : (
            filtered.map((request) => (
              <article className="request-card" key={request.id}>
                <div className="request-top">
                  <div>
                    <label>{request.category}</label>
                    <h2>{request.customer_name}</h2>
                  </div>

                  <span className={`status ${request.status}`}>
                    {request.status.replace("_", " ")}
                  </span>
                </div>

                {request.vehicle && (
                  <div className="vehicle-box">
                    <strong>
                      {request.vehicle.brand} {request.vehicle.model}
                    </strong>

                    <span>
                      {request.vehicle.variant || ""}
                      {request.vehicle.year
                        ? ` • ${request.vehicle.year}`
                        : ""}
                    </span>
                  </div>
                )}

                <div className="request-details">
                  <p>
                    <b>Customer:</b> {request.customer_name}
                  </p>

                  <p>
                    <b>Phone:</b> {request.customer_phone}
                  </p>

                  {request.customer_location && (
                    <p>
                      <b>Customer Location:</b>{" "}
                      {request.customer_location}
                    </p>
                  )}

                  {request.vehicle_location && (
                    <p>
                      <b>Vehicle Location:</b>{" "}
                      {request.vehicle_location}
                    </p>
                  )}

                  {request.preferred_time && (
                    <p>
                      <b>Preferred Time:</b>{" "}
                      {request.preferred_time}
                    </p>
                  )}

                  {request.details && (
                    <p>
                      <b>Details:</b> {request.details}
                    </p>
                  )}
                </div>

                <div className="request-actions">
                  <button
                    className="primary"
                    onClick={() =>
                      callCustomer(request.customer_phone)
                    }
                  >
                    Call Customer
                  </button>

                  <button
                    className="whatsapp"
                    onClick={() => whatsappCustomer(request)}
                  >
                    WhatsApp
                  </button>
                </div>

                <div className="status-control">
                  <span>Update Status</span>

                  <select
                    value={request.status}
                    onChange={(e) =>
                      updateStatus(request.id, e.target.value)
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status
                          .replace("_", " ")
                          .replace(/\b\w/g, (x) =>
                            x.toUpperCase()
                          )}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
