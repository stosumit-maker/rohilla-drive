"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "./app/supabaseClient";

export default function CarPage() {
  const { id } = useParams<{ id: string }>();

  const [car, setCar] = useState<any>(null);
  const [activePhoto, setActivePhoto] = useState(0);

  const db = supabase();

  useEffect(() => {
    async function loadCar() {
      const { data } = await db
        .from("vehicles")
        .select("*, vehicle_photos(url, sort_order)")
        .eq("id", id)
        .eq("status", "published")
        .single();

      setCar(data);
    }

    if (id) {
      loadCar();
    }
  }, [id]);

  if (!car) {
    return (
      <main>
        <div className="section">
          <h2>Loading vehicle…</h2>
        </div>
      </main>
    );
  }

  const photos = (car.vehicle_photos || []).sort(
    (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  const whatsappEnquiry = () => {
    const message = `ROHILLA DRIVE CAR ENQUIRY
Vehicle: ${car.brand} ${car.model} ${car.variant}
Year: ${car.year}
KM: ${car.km}
Price: ₹${car.asking_price}
City: ${car.city}
Vehicle ID: ${car.id}
I am interested in this car.`;

    window.open(
      `https://wa.me/917015260003?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

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
          <div className="mainPhoto">
            {photos[activePhoto]?.url ? (
              <img
                src={photos[activePhoto].url}
                alt={`${car.brand} ${car.model}`}
              />
            ) : (
              <span>🚘</span>
            )}
          </div>

          {photos.length > 0 && (
            <div className="thumbs">
              {photos.map((photo: any, index: number) => (
                <button
                  key={`${photo.url}-${index}`}
                  onClick={() => setActivePhoto(index)}
                >
                  <img
                    src={photo.url}
                    alt={`${car.brand} ${car.model} ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="carInfo">
          <label>ROHILLA DRIVE</label>

          <h1>
            {car.brand} {car.model} {car.variant}
          </h1>

          <div className="specs">
            <span>{car.year}</span>
            <span>{Number(car.km).toLocaleString()} km</span>
            <span>{car.fuel}</span>
            <span>{car.owner_count} Owner</span>
            <span>{car.city}</span>
          </div>

          <h2>
            ₹{Number(car.asking_price).toLocaleString("en-IN")}
          </h2>

          {car.public_notes && <p>{car.public_notes}</p>}

          <button className="primary" onClick={whatsappEnquiry}>
            WhatsApp Enquiry
          </button>

          <a className="call big" href="tel:7015260003">
            Call 7015260003
          </a>
        </div>
      </section>
    </main>
  );
}
