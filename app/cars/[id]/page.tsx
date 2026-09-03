"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../app/supabaseClient";

export default function CarPage() {
  const { id } = useParams<{ id: string }>();
  const [c, setC] = useState<any>(null);

  const db = supabase();

  useEffect(() => {
    db.from("vehicles")
      .select("*,vehicle_photos(url,sort_order)")
      .eq("id", id)
      .eq("status", "published")
      .single()
      .then(({ data }) => setC(data));
  }, [id]);

  if (!c) {
    return (
      <main>
        <div className="section">
          <h2>Loading vehicle…</h2>
        </div>
      </main>
    );
  }

  const photos = (c.vehicle_photos || []).sort(
    (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  const wa = () =>
    window.open(
      `https://wa.me/917015260003?text=${encodeURIComponent(
        `ROHILLA DRIVE CAR ENQUIRY
Vehicle: ${c.brand} ${c.model} ${c.variant}
Year: ${c.year}
KM: ${c.km}
Price: ₹${c.asking_price}
City: ${c.city}
Vehicle ID: ${c.id}
I am interested in this car.`
      )}`,
      "_blank"
    );

  return (
    <main>
      <header>
        <div className="brand">
          <b>ROHILLA DRIVE</b>
          <small>by Rohilla Multibrand Cars</small>
        </div>

        <a href="/">← Back to Cars</a>
      </header>

      <section className="carDetail">
        <div>
          <div className="mainPhoto swipeGallery">
            {photos.length ? (
              photos.map((p: any) => (
                <img
                  key={p.url}
                  src={p.url}
                  alt={`${c.brand} ${c.model}`}
                />
              ))
            ) : (
              <span>🚘</span>
            )}
          </div>

          {photos.length > 1 && (
            <p className="swipeHint">
              ← Swipe left or right to view all photos →
            </p>
          )}
        </div>

        <div className="carInfo">
         
