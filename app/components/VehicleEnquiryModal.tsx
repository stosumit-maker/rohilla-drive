"use client";

import { useState } from "react";
import { supabase } from "../supabaseClient";
import LegalConsent from "./LegalConsent";
import { newRequestReference } from "../lib/reference";
import { track } from "@vercel/analytics";

type VehicleEnquiryTarget = {
  id: string;
  brand: string;
  model: string;
  variant?: string | null;
  year?: number | null;
  asking_price?: number | null;
  city?: string | null;
  vehicle_type?: string | null;
};

export default function VehicleEnquiryModal({
  vehicle,
  source,
  onClose,
  mode = "enquiry",
}: {
  vehicle: VehicleEnquiryTarget;
  source: "inventory_page" | "vehicle_detail_page";
  onClose: () => void;
  mode?: "enquiry" | "booking";
}) {
  const db = supabase();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setBusy(true);
    setError("");

    const isBooking = mode === "booking";
    const ref = newRequestReference(isBooking ? "RDB" : "RDQ");
    const description = [
      `Reference: ${ref}`,
      `Interested in ${vehicle.year || ""} ${vehicle.brand} ${vehicle.model} ${vehicle.variant || ""}`.trim(),
      vehicle.asking_price ? `Listed price: ₹${Number(vehicle.asking_price).toLocaleString("en-IN")}` : "",
      location.trim() ? `Customer location: ${location.trim()}` : "",
      message.trim(),
    ].filter(Boolean).join("\n");

    const { error: insertError } = await db
      .from("leads")
      .insert({
        vehicle_id: vehicle.id,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        requirement: isBooking ? "Vehicle booking request" : "Vehicle purchase enquiry",
        message: description,
        status: "new",
        source,
        enquiry_type: "buy_vehicle",
        new_or_used: "used",
        budget: vehicle.asking_price || null,
        preferred_brand: vehicle.brand || null,
        preferred_model: vehicle.model || null,
        vehicle_type: vehicle.vehicle_type || "car",
        customer_city: location.trim() || null,
      });

    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    track("Lead Submitted",{surface:source,intent:isBooking?"vehicle_booking":"buy_vehicle",brand:vehicle.brand,model:vehicle.model});

    const wa = [
      isBooking ? "ROHILLA DRIVE VEHICLE BOOKING REQUEST" : "ROHILLA DRIVE VEHICLE ENQUIRY",
      "",
      `Vehicle: ${vehicle.year || ""} ${vehicle.brand} ${vehicle.model} ${vehicle.variant || ""}`.trim(),
      vehicle.asking_price ? `Price: ₹${Number(vehicle.asking_price).toLocaleString("en-IN")}` : "",
      `Vehicle ID: ${vehicle.id}`,
      `Enquiry Ref: ${ref}`,
      "",
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      location.trim() ? `Location: ${location.trim()}` : "",
      message.trim() ? `Message: ${message.trim()}` : "",
      "",
      "This enquiry is saved with ROHILLA DRIVE.",
    ].filter(Boolean).join("\n");

    window.location.href = `https://wa.me/917015260003?text=${encodeURIComponent(wa)}`;
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Vehicle enquiry">
      <div className="modal">
        <button type="button" className="x" onClick={onClose} aria-label="Close enquiry form">×</button>
        <h2>{mode==="booking" ? "Book this vehicle" : "Enquire about this vehicle"}</h2>
        <p><b>{vehicle.year || ""} {vehicle.brand} {vehicle.model} {vehicle.variant || ""}</b></p>
        <p>{mode==="booking" ? "Send a booking request for this vehicle. Our team will confirm availability and booking terms before any payment." : "Your enquiry will be saved first, then WhatsApp will open with the same vehicle details."}</p>
        <form className="adminForm" onSubmit={submit}>
          <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <input required inputMode="tel" placeholder="Mobile / WhatsApp number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input placeholder="Your city / location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <textarea placeholder={mode==="booking" ? "Booking note, preferred visit time or any question" : "Any question, exchange or finance requirement"} value={message} onChange={(e) => setMessage(e.target.value)} />
          <LegalConsent />
          <button disabled={busy}>{busy ? (mode==="booking" ? "Saving booking request…" : "Saving enquiry…") : (mode==="booking" ? "Send Booking Request & Continue on WhatsApp" : "Save Enquiry & Continue on WhatsApp")}</button>
        </form>
        {error && <div className="notice">{error}</div>}
      </div>
    </div>
  );
}
