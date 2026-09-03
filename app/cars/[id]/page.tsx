"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../app/supabaseClient";

export default function CarPage() {
  const { id } = useParams<{ id: string }>();

  const [c, setC] = useState<any>(null);
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const pinchStart = useRef<{
    distance: number;
    zoom: number;
  } | null>(null);

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

  const resetZoom = () => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };

  const openFullscreen = () => {
    resetZoom();
    setFullscreen(true);
  };

  const closeFullscreen = () => {
    resetZoom();
    setFullscreen(false);
  };

  const nextPhoto = () => {
    if (!photos.length) return;
    resetZoom();
    setActive((old) => (old + 1) % photos.length);
  };

  const previousPhoto = () => {
    if (!photos.length) return;
    resetZoom();
    setActive((old) => (old - 1 + photos.length) % photos.length);
  };

  const handleNormalTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleNormalTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!touchStart.current || e.changedTouches.length !== 1) return;

    const diffX =
      e.changedTouches[0].clientX - touchStart.current.x;

    touchStart.current = null;

    if (Math.abs(diffX) > 60) {
      if (diffX < 0) nextPhoto();
      else previousPhoto();
    }
  };

  const distanceBetweenTouches = (touches: TouchList) => {
    if (touches.length < 2) return 0;

    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;

    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleFullscreenTouchStart = (
    e: TouchEvent<HTMLDivElement>
  ) => {
    if (e.touches.length === 2) {
      pinchStart.current = {
        distance: distanceBetweenTouches(e.touches),
        zoom,
      };
      touchStart.current = null;
    } else if (e.touches.length === 1 && zoom > 1) {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 1) {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleFullscreenTouchMove = (
    e: TouchEvent<HTMLDivElement>
  ) => {
    if (e.touches.length === 2 && pinchStart.current) {
      const distance = distanceBetweenTouches(e.touches);

      if (distance > 0) {
        const ratio =
          distance / pinchStart.current.distance;

        const newZoom = Math.min(
          4,
          Math.max(
            1,
            pinchStart.current.zoom * ratio
          )
        );

        setZoom(newZoom);

        if (newZoom === 1) {
          setPos({ x: 0, y: 0 });
        }
      }

      return;
    }

    if (
      e.touches.length === 1 &&
      zoom > 1 &&
      touchStart.current
    ) {
      const dx =
        e.touches[0].clientX -
        touchStart.current.x;

      const dy =
        e.touches[0].clientY -
        touchStart.current.y;

      setPos((old) => ({
        x: old.x + dx,
        y: old.y + dy,
      }));

      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleFullscreenTouchEnd = (
    e: TouchEvent<HTMLDivElement>
  ) => {
    if (e.touches.length < 2) {
      pinchStart.current = null;
    }

    if (
      zoom <= 1 &&
      e.changedTouches.length === 1 &&
      touchStart.current
    ) {
      const diffX =
        e.changedTouches[0].clientX -
        touchStart.current.x;

      if (Math.abs(diffX) > 70) {
        if (diffX < 0) nextPhoto();
        else previousPhoto();
      }
    }

    if (e.touches.length === 0) {
      touchStart.current = null;
    }
  };

  const zoomIn = () => {
    setZoom((old) => Math.min(4, old + 0.5));
  };

  const zoomOut = () => {
    setZoom((old) => {
      const next = Math.max(1, old - 0.5);

      if (next === 1) {
        setPos({ x: 0, y: 0 });
      }

      return next;
    });
  };

  const wa = () => {
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
          <div
            className="detailViewer"
            onTouchStart={handleNormalTouchStart}
            onTouchEnd={handleNormalTouchEnd}
          >
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
                  onClick={openFullscreen}
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
                  onClick={openFullscreen}
                >
                  ⛶ Fullscreen
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
                  className={
                    index === active
                      ? "thumb active"
                      : "thumb"
                  }
                  onClick={() => {
                    resetZoom();
                    setActive(index);
                  }}
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
              ← Swipe photos • Tap photo to zoom →
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
            <span>
              {Number(c.km).toLocaleString()} km
            </span>
            <span>{c.fuel}</span>
            <span>{c.owner_count} Owner</span>
            <span>{c.city}</span>
          </div>

          <h2>
            ₹
            {Number(c.asking_price).toLocaleString(
              "en-IN"
            )}
          </h2>

          <p>{c.public_notes}</p>

          <button className="primary" onClick={wa}>
            WhatsApp Enquiry
          </button>

          <a
            className="call big"
            href="tel:7015260003"
          >
            Call 7015260003
          </a>
        </div>
      </section>

      {fullscreen && currentPhoto && (
        <div
          className="fullscreenViewer"
          onClick={closeFullscreen}
          onTouchStart={handleFullscreenTouchStart}
          onTouchMove={handleFullscreenTouchMove}
          onTouchEnd={handleFullscreenTouchEnd}
        >
          <button
            className="closeViewer"
            onClick={(e) => {
              e.stopPropagation();
              closeFullscreen();
            }}
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

          <div
            className="fullscreenImageWrap"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              className="fullscreenImage"
              src={currentPhoto}
              alt={`${c.brand} ${c.model}`}
              style={{
                transform:
                  `translate(${pos.x}px, ${pos.y}px) ` +
                  `scale(${zoom})`,
              }}
            />
          </div>

          <button
            className="fullscreenArrow right"
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
          >
            ›
          </button>

          <div
            className="zoomControls"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={zoomOut}>−</button>

            <span>
              {Math.round(zoom * 100)}%
            </span>

            <button onClick={zoomIn}>+</button>

            <button onClick={resetZoom}>
              Reset
            </button>
          </div>

          <div className="fullscreenCounter">
            {active + 1} / {photos.length}
          </div>

          <p className="fullscreenHint">
            Swipe photos • Pinch to zoom • Drag photo
          </p>
        </div>
      )}

      <style jsx global>{`
        .detailViewer {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          min-height: 250px;
          overflow: hidden;
          border-radius: 18px;
          background: #f1f3f6;
          touch-action: pan-x;
        }

        .detailViewer > img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          cursor: zoom-in;
        }

        .photoArrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          width: 42px;
          height: 42px;
          border: 0;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.55);
          color: white;
          font-size: 32px;
          line-height: 35px;
        }

        .photoArrow.left {
          left: 12px;
        }

        .photoArrow.right {
          right: 12px;
        }

        .zoomButton {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          border: 0;
          border-radius: 20px;
          padding: 9px 15px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 13px;
        }

        .photoCounter {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 10px;
          border-radius: 15px;
          background: rgba(0, 0, 0, 0.65);
          color: white;
          font-size: 12px;
        }

        .detailThumbs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 10px 0;
        }

        .thumb {
          flex: 0 0 70px;
          width: 70px;
          height: 55px;
          padding: 0;
          border: 2px solid transparent;
          border-radius: 8px;
          overflow: hidden;
          background: #eee;
        }

        .thumb.active {
          border-color: #1f5eff;
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .fullscreenViewer {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0, 0, 0, 0.96);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          touch-action: none;
        }

        .fullscreenImageWrap {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .fullscreenImage {
          max-width: 92vw;
          max-height: 72vh;
          width: auto;
          height: auto;
          object-fit: contain;
          user-select: none;
          -webkit-user-drag: none;
          transform-origin: center center;
          will-change: transform;
        }

        .closeViewer {
          position: absolute;
          top: 18px;
          right: 18px;
          z-index: 10;
          width: 42px;
          height: 42px;
          border: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          color: white;
          font-size: 20px;
        }

        .fullscreenArrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          color: white;
          font-size: 34px;
        }

        .fullscreenArrow.left {
          left: 12px;
        }

        .fullscreenArrow.right {
          right: 12px;
        }

        .zoomControls {
          position: absolute;
          bottom: 42px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 30px;
          background: rgba(0, 0, 0, 0.65);
        }

        .zoomControls button {
          min-width: 38px;
          height: 38px;
          border: 0;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.18);
          color: white;
          font-weight: 700;
        }

        .zoomControls span {
          color: white;
          min-width: 55px;
          text-align: center;
          font-size: 13px;
        }

        .fullscreenCounter {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          color: white;
          background: rgba(0, 0, 0, 0.55);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
        }

        .fullscreenHint {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          margin: 0;
          white-space: nowrap;
        }

        @media (max-width: 800px) {
          .carDetail {
            grid-template-columns: 1fr !important;
            width: 100%;
            max-width: 760px;
            margin: 28px auto;
            padding: 0 16px;
            gap: 18px;
          }

          .detailViewer {
            width: 100%;
            aspect-ratio: 16 / 10;
            min-height: 0;
            border-radius: 16px;
          }

          .carInfo {
            padding: 8px 2px;
          }

          .carInfo h1 {
            font-size: 32px;
            line-height: 1.1;
          }
        }

        @media (max-width: 600px) {
          .detailViewer {
            aspect-ratio: 16 / 10;
          }

          .thumb {
            flex-basis: 64px;
            width: 64px;
            height: 50px;
          }

          .fullscreenImage {
            max-width: 92vw;
            max-height: 70vh;
          }

          .fullscreenHint {
            font-size: 11px;
          }
        }
      `}</style>
    </main>
  );
    }
