import React, { useEffect, useMemo, useState } from "react";

const API_KEY = "8d7ff3e95153c5f8466997cf742b3924";
const API_URL = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const DEFAULT_CITY = "London";

const iconByCondition = {
  Clouds: "/images/clouds.png",
  Clear: "/images/clear.png",
  Rain: "/images/rain.png",
  Drizzle: "/images/drizzle.png",
  Mist: "/images/mist.png",
  Snow: "/images/snow.png",
};

const initialWeather = {
  name: "--",
  temperature: "--",
  humidity: "--",
  windSpeed: "--",
  icon: "/images/rain.png",
  condition: "",
};

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(initialWeather);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasData = useMemo(() => true, []);

  async function loadWeather(location) {
    const trimmedLocation = location.trim();

    if (!trimmedLocation) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}${encodeURIComponent(trimmedLocation)}&appid=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Location not found");
      }

      const payload = await response.json();
      const condition = payload.weather?.[0]?.main ?? "";

      setWeather({
        name: payload.name,
        temperature: Math.round(payload.main.temp),
        humidity: payload.main.humidity,
        windSpeed: payload.wind.speed,
        icon: iconByCondition[condition] ?? "/images/wind.png",
        condition,
      });
      setCity("");
    } catch (loadError) {
      setError(loadError.message || "Failed to fetch weather data");
      setWeather(initialWeather);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWeather(DEFAULT_CITY);
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    loadWeather(city);
  }

  return (
    <main className="app-shell">
      <section className="weather-widget-container">
        <div className="header-copy">
          <p className="eyebrow">Live Weather</p>
          <h1 className="app-header">Current Conditions</h1>
          <p className="subhead">Search any city and get the latest temperature, humidity, and wind reading.</p>
        </div>

        <form className="input-wrapper" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search for a location..."
            spellCheck="false"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
          <button type="submit" disabled={loading} aria-label="Search weather">
            <img src="/images/search.svg" alt="Search" />
          </button>
        </form>

        {error ? (
          <div className="invalid-feedback" role="alert">
            <p>{error} Please try again.</p>
          </div>
        ) : null}
        <div className="forecast-section">
          <img src={weather.icon} alt={weather.condition || "Current condition"} className="condition-img" />
          <h1 className="temperature-display">{loading ? "..." : `${weather.temperature}°C`}</h1>
          <h2 className="location-name">{weather.name}</h2>
          <p className="condition-label">{weather.condition}</p>

          <div className="metrics-container">
            <div className="metric-item">
              <img src="/images/humidity.png" alt="Humidity" />
              <div>
                <p className="moisture-level">{loading ? "..." : `${weather.humidity}%`}</p>
                <p>Humidity</p>
              </div>
            </div>

            <div className="metric-item">
              <img src="/images/wind.png" alt="Wind speed" />
              <div>
                <p className="breeze-speed">{loading ? "..." : `${weather.windSpeed} km/h`}</p>
                <p>Wind</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}