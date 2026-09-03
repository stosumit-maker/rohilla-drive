"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  km: number;
  fuel: string;
  owner_count?: number;
  asking_price: number;
  city?: string;
  public_notes?: string;
  vehicle_photos?: { url: string; sort_order?: number }[];
};

export default function Home() {
  const db = supabase();

  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fuel, setFuel] = useState("All");
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadMessage, setLeadMessage] = useState("");

  useEffect(() => {
    async function loadCars() {
      const { data } = await db
        .from("vehicles")
        .select("*,vehicle_photos(url,sort_order)")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      setCars((data || []) as Vehicle[]);
      setLoading(false);
    }

    loadCars();
  }, []);

  const filteredCars = useMemo(() => {
    const q = search.trim().toLowerCase();

    return cars.filter((car) => {
      const text =
        `${car.brand} ${car.model} ${car.variant || ""} ${car.year} ${car.city || ""}`
          .toLowerCase();

      const matchesSearch = !q || text.includes(q);
      const matchesFuel = fuel === "All" || car.fuel === fuel;

      return matchesSearch && matchesFuel;
    });
  }, [cars, search, fuel]);

  function whatsapp(text: string) {
    window.open(
      `https://wa.me/917015260003?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  function openLead(type: string) {
    setLeadMessage(
      `Hello Rohilla Drive, I am interested in your ${type} service. Please contact me.`
    );
    setLeadOpen(true);
  }

  function submitLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    whatsapp(
      `${leadMessage}\n\nROHILLA DRIVE\n7015260003`
    );

    setLeadOpen(false);
  }

  return (
    <main>
      <header>
        <div className="brand">
          <b>ROHILLA DRIVE</b>
          <small>by Rohilla Multibrand Cars</small>
        </div>

        <nav>
          <a href="#cars">Cars</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
        </nav>

        <div className="topActions">
          <div className="socialIcons">
            <a
              href="https://www.instagram.com/rohillamultibrandcars/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="instagram"
            >
              ◎
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="facebook"
            >
              f
            </a>

            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="youtube"
            >
              ▶
            </a>
          </div>

          <button
            className="waTop"
            onClick={() =>
              whatsapp(
                "Hello Rohilla Drive, I want to know about available cars."
              )
            }
          >
            WhatsApp
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="heroText">
          <span>PRE-OWNED CARS • TRUSTED AUTOMOBILE NETWORK</span>

          <h1>
            Find your next
            <br />
            car with confidence.
          </h1>

          <p>
            Buy, sell, exchange and explore quality pre-owned cars through
            Rohilla Drive.
          </p>

          <div className="search">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand, model, year or city..."
            />

            <select
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
            >
              <option>All</option>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>CNG</option>
              <option>Electric</option>
              <option>Hybrid</option>
            </select>

            <button
              onClick={() =>
                document
                  .getElementById("cars")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Search Cars
            </button>
          </div>
        </div>
      </section>

      <section className="section" id="cars">
        <div className="head">
          <div>
            <h2>Featured Cars</h2>
            <p>
              {loading
                ? "Loading available cars..."
                : `${filteredCars.length} cars available`}
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading inventory...</p>
        ) : filteredCars.length === 0 ? (
          <div className="card">
            <div className="body">
              <h3>No matching cars found</h3>
              <p>Try another brand, model, fuel type or city.</p>
            </div>
          </div>
        ) : (
          <div className="grid">
            {filteredCars.map((car) => {
              const photos = [...(car.vehicle_photos || [])].sort(
                (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
              );

              return (
                <article className="card" key={car.id}>
                  <div className="photo real swipeGallery">
                    {photos.length ? (
                      photos.map((photo, index) => (
                        <img
                          key={photo.url || index}
                          src={photo.url}
                          alt={`${car.brand} ${car.model} photo ${index + 1}`}
                        />
                      ))
                    ) : (
                      <span>🚘</span>
                    )}
                  </div>

                  {photos.length > 1 && (
                    <div className="swipeHint">
                      ← Swipe →
                    </div>
                  )}

                  <div className="body">
                    <label>ROHILLA DRIVE</label>

                    <h3>
                      {car.brand} {car.model}
                    </h3>

                    {car.variant && <p>{car.variant}</p>}

                    <small>
                      {car.year} •{" "}
                      {Number(car.km).toLocaleString("en-IN")} km •{" "}
                      {car.fuel}
                      {car.owner_count
                        ? ` • ${car.owner_count} Owner`
                        : ""}
                    </small>

                    <strong>
                      ₹{Number(car.asking_price).toLocaleString("en-IN")}
                    </strong>

                    <a
                      className="call"
                      href={`/cars/${car.id}`}
                      style={{
                        display: "block",
                        textAlign: "center",
                        marginBottom: "10px",
                      }}
                    >
                      View Details
                    </a>

                    <button
                      onClick={() =>
                        whatsapp(
                          `ROHILLA DRIVE CAR ENQUIRY

Vehicle: ${car.brand} ${car.model} ${car.variant || ""}
Year: ${car.year}
KM: ${car.km}
Fuel: ${car.fuel}
Price: ₹${car.asking_price}
City: ${car.city || ""}
Vehicle ID: ${car.id}

I am interested in this car.`
                        )
                      }
                    >
                      WhatsApp Enquiry
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="section">
        <div className="quickLead">
          <div>
            <h2>Looking for a specific car?</h2>
            <p>
              Tell us your budget and requirement. Our team will help you find
              the right vehicle.
            </p>
          </div>

          <div className="quickLeadBtns">
            <button onClick={() => openLead("car purchase")}>
              Find a Car
            </button>

            <button
              className="secondary"
              onClick={() => openLead("car sale")}
            >
              Sell Your Car
            </button>
          </div>
        </div>
      </section>

      <section className="section" id="services">
        <div className="head">
          <div>
            <h2>Automobile Services</h2>
            <p>One network for your complete automobile needs.</p>
          </div>
        </div>

        <div className="services">
          <button onClick={() => openLead("car inspection")}>
            🔍 Car Inspection
          </button>

          <button onClick={() => openLead("car finance")}>
            💳 Finance
          </button>

          <button onClick={() => openLead("insurance")}>
            🛡️ Insurance
          </button>

          <button onClick={() => openLead("RC transfer")}>
            📄 RC Transfer
          </button>

          <button onClick={() => openLead("car detailing")}>
            ✨ Detailing
          </button>

          <button onClick={() => openLead("workshop service")}>
            🔧 Workshop
          </button>

          <button onClick={() => openLead("RSA assistance")}>
            🚗 RSA
          </button>

          <button onClick={() => openLead("car exchange")}>
            🔄 Exchange
          </button>
        </div>
      </section>

      <section className="section dark" id="about">
        <div className="about">
          <h2>ROHILLA DRIVE</h2>

          <p>
            A modern automobile network by Rohilla Multibrand Cars for buying,
            selling, exchanging and managing pre-owned vehicles.
          </p>

          <div className="aboutGrid">
            <div>
              <h3>Buy</h3>
              <p>
                Explore published inventory with photos, specifications and
                direct enquiry.
              </p>
            </div>

            <div>
              <h3>Sell</h3>
              <p>
                Share your vehicle details with our team and get assistance
                with the selling process.
              </p>
            </div>

            <div>
              <h3>Network</h3>
              <p>
                Access automobile partners for finance, insurance, inspection,
                workshop and other services.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <b>ROHILLA DRIVE</b>

        <p>
          by Rohilla Multibrand Cars
          <br />
          Ambala City
        </p>

        <p>
          <a href="tel:7015260003">7015260003</a>
        </p>

        <div className="footerSocial">
          <div className="socialIcons">
            <a
              href="https://www.instagram.com/rohillamultibrandcars/"
              target="_blank"
              rel="noreferrer"
              className="instagram"
            >
              ◎
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              className="facebook"
            >
              f
            </a>

            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noreferrer"
              className="youtube"
            >
              ▶
            </a>
          </div>
        </div>
      </footer>

      <button
        className="floatingWa"
        onClick={() =>
          whatsapp(
            "Hello Rohilla Drive, I want to enquire about your cars and services."
          )
        }
      >
        WhatsApp
      </button>

      {leadOpen && (
        <div className="overlay">
          <div className="modal">
            <button className="x" onClick={() => setLeadOpen(false)}>
              ×
            </button>

            <h2>Tell us what you need</h2>

            <p>
              Send your requirement directly to Rohilla Drive on WhatsApp.
            </p>

            <form onSubmit={submitLead}>
              <textarea
                value={leadMessage}
                onChange={(e) => setLeadMessage(e.target.value)}
                rows={5}
                required
              />

              <button type="submit">Continue on WhatsApp</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
