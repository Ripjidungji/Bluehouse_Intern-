import { useEffect, useState } from "react";
import {
  CloudSun,
  LocateFixed,
  Heart,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import SearchBar from "./components/SearchBar";
import CityModal from "./components/CityModal";
import { searchCities, getWeather, getWeatherDescription } from "./api";

const popularCities = [
  { name: "Lagos", country: "Nigeria", latitude: 6.5244, longitude: 3.3792 },
  { name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 },
  { name: "New York", country: "United States", latitude: 40.7128, longitude: -74.006 },
];

export default function App() {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const lastCity = localStorage.getItem("last-weather-city");
    if (lastCity) {
      try {
        const city = JSON.parse(lastCity);
        openCity(city);
      } catch {
        localStorage.removeItem("last-weather-city");
      }
    }
  }, []);

  async function openCity(city) {
    setLoading(true);
    setMessage("");
    try {
      const data = await getWeather(city.latitude, city.longitude);
      setSelectedCity(city);
      setWeather(data);
      localStorage.setItem("last-weather-city", JSON.stringify(city));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      const results = await searchCities(query.trim());
      setCities(results);

      if (!results.length) {
        setMessage("No cities found. Try another city name.");
        return;
      }

      await openCity(results[0]);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const closeModal = () => {
    setSelectedCity(null);
    setWeather(null);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-sky-950">
      <div className="relative isolate min-h-screen">
        <div className="pointer-events-none absolute left-1/4 top-0 -z-10 h-80 w-80 rounded-full bg-sky-400/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-violet-500/20 blur-[130px]" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-white/10 p-2 backdrop-blur-md">
              <CloudSun className="h-6 w-6 text-sky-200" />
            </div>
            <span className="text-lg font-bold tracking-tight">Atmos</span>
          </div>
          <div className="hidden items-center gap-6 text-sm text-slate-300 sm:flex">
            <span>Live weather</span>
            <span>7-day forecast</span>
            <span>City reviews</span>
          </div>
        </nav>

        <section className="mx-auto max-w-7xl px-5 pb-16 pt-14 text-center lg:px-8 lg:pt-24">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-sky-100 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Weather, beautifully simplified
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Discover the weather
            <span className="block bg-gradient-to-r from-sky-200 via-white to-indigo-200 bg-clip-text text-transparent">
              anywhere in the world.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Search for a city to see live conditions, a seven-day outlook,
            useful weather stats and community reviews.
          </p>

          <div className="mt-9">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={handleSearch}
              loading={loading}
            />
          </div>

          {message && (
            <div className="mx-auto mt-4 flex max-w-2xl items-center justify-center gap-2 text-sm text-rose-200">
              <AlertCircle className="h-4 w-4" />
              {message}
            </div>
          )}

          {cities.length > 1 && (
            <div className="mx-auto mt-4 max-w-2xl rounded-2xl border border-white/10 bg-slate-900/70 p-2 text-left backdrop-blur-xl">
              <p className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500">
                Other matches
              </p>
              {cities.slice(1).map((city) => (
                <button
                  key={`${city.id}-${city.latitude}`}
                  onClick={() => openCity(city)}
                  className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-white/10"
                >
                  <span className="font-medium text-white">{city.name}</span>
                  <span className="ml-2 text-sm text-slate-400">
                    {[city.admin1, city.country].filter(Boolean).join(", ")}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="mx-auto mt-14 max-w-5xl text-left">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sky-200/70">
                  Quick access
                </p>
                <h2 className="mt-1 text-xl font-bold">Popular destinations</h2>
              </div>
              <Heart className="h-5 w-5 text-white/30" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {popularCities.map((city) => (
                <PopularCard key={city.name} city={city} onClick={() => openCity(city)} />
              ))}
            </div>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 text-left sm:grid-cols-3">
            <Feature title="Live conditions" text="Temperature, humidity, wind and rain probability." />
            <Feature title="7-day outlook" text="Plan ahead with a clean, easy-to-read forecast." />
            <Feature title="Community reviews" text="Leave a rating and review for each city." />
          </div>

          <p className="mt-12 text-xs text-slate-500">
            Weather data powered by Open-Meteo. No API key required.
          </p>
        </section>
      </div>

      {selectedCity && (
        <CityModal city={selectedCity} weather={weather} onClose={closeModal} />
      )}
    </main>
  );
}

function PopularCard({ city, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-left backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/[0.1]"
    >
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-white/10 p-3">
          <LocateFixed className="h-5 w-5 text-sky-200" />
        </div>
        <span className="text-sm text-slate-500 group-hover:text-sky-200">Open →</span>
      </div>
      <h3 className="mt-6 text-xl font-bold">{city.name}</h3>
      <p className="mt-1 text-sm text-slate-400">{city.country}</p>
    </button>
  );
}

function Feature({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}