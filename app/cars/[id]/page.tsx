"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../app/supabaseClient";

export default function CarPage() {
  const { id } = useParams<{ id: string }>();

  const [c, setC] = useState<any>(null);
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

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

  const photos = [...(c.vehicle_photos || [])].sort(
    (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  const currentPhoto = photos[active]?.url;

  const nextPhoto = () => {
    if (!photos.length) return;
    setActive((prev) => (prev + 1) % photos.length);
  };

  const previousPhoto = () => {
    if (!photos.length) return;
    setActive((prev) => (prev - 1 + photos.length) % photos.length);
  };

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
          <div className="detailViewer">
            {currentPhoto ? (
              <>
                <button
                  className="photoArrow left"
                  onClick={previousPhoto}
                  aria-label="Previous photo"
                >
                  ‹
                </button>

                <img
                  src={currentPhoto}
                  alt={`${c.brand} ${c.model}`}
                  onClick={() => setFullscreen(true)}
                />

                <button
                  className="photoArrow right"
                  onClick={nextPhoto}
                  aria-label="Next photo"
                >
                  ›
                </button>

                <button
                  className="zoomButton"
                  onClick={() => setFullscreen(true)}
                >
                  ⛶ View Fullscreen
                </button>

                <div className="photoCounter">
                  {active + 1} / {photos.length}
                </div>
              </>
            ) : (
              <span>🚘</span>
            )}
          </div>

          {photos.length > 1 && (
            <div className="detailThumbs">
              {photos.map((photo: any, index: number) => (
                <button
                  key={photo.url || index}
                  className={index === active ? "thumb active" : "thumb"}
                  onClick={() => setActive(index)}
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}

          {photos.length > 1 && (
            <p className="swipeHint">
              ← Swipe photos • Tap photo for full screen & zoom →
            </p>
          )}
        </div>

        <div className="carInfo">
          <label>ROHILLA DRIVE</label>

          <h1>
            {c.brand} {c.model} {c.variant}
          </h1>

          <div className="specs">
            <span>{c.year}</span>
            <span>{Number(c.km).toLocaleString()} km</span>
            <span>{c.fuel}</span>
            <span>{c.owner_count} Owner</span>
            <span>{c.city}</span>
          </div>

          <h2>₹{Number(c.asking_price).toLocaleString("en-IN")}</h2>

          <p>{c.public_notes}</p>

          <button className="primary" onClick={wa}>
            WhatsApp Enquiry
          </button>

          <a className="call big" href="tel:7015260003">
            Call 7015260003
          </a>
        </div>
      </section>

      {fullscreen && currentPhoto && (
        <div
          className="fullscreenViewer"
          onClick={() => setFullscreen(false)}
        >
          <button
            className="closeViewer"
            onClick={() => setFullscreen(false)}
          >
            ✕
          </button>

          <button
            className="fullscreenArrow left"
            onClick={(e) => {
              e.stopPropagation();
              previousPhoto();
            }}
          >
            ‹
          </button>

          <img
            className="fullscreenImage"
            src={currentPhoto}
            alt={`${c.brand} ${c.model} fullscreen`}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="fullscreenArrow right"
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
          >
            ›
          </button>

          <div className="fullscreenCounter">
            {active + 1} / {photos.length}
          </div>

          <p className="fullscreenHint">
            Swipe • Pinch to zoom • Tap ✕ to close
          </p>
        </div>
      )}
    </main>
  );
}
