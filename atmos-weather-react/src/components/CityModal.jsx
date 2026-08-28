import { useEffect, useState } from "react";
import {
  X,
  Wind,
  Droplets,
  Thermometer,
  Umbrella,
  Star,
} from "lucide-react";
import { getWeatherDescription } from "../api";

export default function CityModal({ city, weather, onClose }) {
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState([
    { rating: 5, text: "The weather looks beautiful today!", date: "Today" },
  ]);

  useEffect(() => {
    const previous = localStorage.getItem(`weather-review-${city.id}`);
    if (previous) setReviews(JSON.parse(previous));
  }, [city.id]);

  if (!weather) return null;

  const [description, icon] = getWeatherDescription(weather.current.weather_code);
  const saveReview = (e) => {
    e.preventDefault();
    if (!review.trim()) return;

    const next = [
      { rating, text: review.trim(), date: "Just now" },
      ...reviews,
    ];
    setReviews(next);
    localStorage.setItem(`weather-review-${city.id}`, JSON.stringify(next));
    setReview("");
    setRating(5);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/15 bg-slate-900/95 shadow-2xl shadow-black/40">
        <div className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />

          <button
            onClick={onClose}
            aria-label="Close weather modal"
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-200">
              Current weather
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {city.name}
            </h2>
            <p className="mt-1 text-slate-300">
              {[city.admin1, city.country].filter(Boolean).join(", ")}
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="flex items-center gap-4">
                  <span className="text-6xl">{icon}</span>
                  <div>
                    <div className="text-6xl font-bold tracking-tight">
                      {Math.round(weather.current.temperature_2m)}°
                    </div>
                    <p className="mt-1 text-lg text-slate-300">{description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Stat icon={<Thermometer />} label="Feels like" value={`${Math.round(weather.current.apparent_temperature)}°`} />
                <Stat icon={<Droplets />} label="Humidity" value={`${weather.current.relative_humidity_2m}%`} />
                <Stat icon={<Wind />} label="Wind" value={`${Math.round(weather.current.wind_speed_10m)} km/h`} />
                <Stat icon={<Umbrella />} label="Rain chance" value={`${weather.daily.precipitation_probability_max?.[0] ?? 0}%`} />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold">7-day outlook</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {weather.daily.time.map((date, index) => {
                  const [dayText, dayIcon] = getWeatherDescription(
                    weather.daily.weather_code[index]
                  );
                  const day = new Date(`${date}T12:00:00`).toLocaleDateString(
                    undefined,
                    { weekday: "short" }
                  );

                  return (
                    <div
                      key={date}
                      className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center"
                    >
                      <p className="text-xs text-slate-400">{day}</p>
                      <div className="my-2 text-2xl">{dayIcon}</div>
                      <p className="text-sm font-semibold">
                        {Math.round(weather.daily.temperature_2m_max[index])}°
                      </p>
                      <p className="text-xs text-slate-400">
                        {Math.round(weather.daily.temperature_2m_min[index])}°
                      </p>
                      <p className="mt-2 truncate text-[10px] text-slate-400">
                        {dayText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">City review</h3>
                  <p className="text-sm text-slate-400">
                    Share your thoughts about the weather.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-300">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-semibold">{reviews.length}</span>
                </div>
              </div>

              <form onSubmit={saveReview} className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRating(item)}
                      aria-label={`Rate ${item} star${item > 1 ? "s" : ""}`}
                      className="transition hover:scale-110"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          item <= rating
                            ? "fill-amber-300 text-amber-300"
                            : "text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="What do you think about today's weather?"
                  rows="3"
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50"
                />
                <button className="mt-3 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-300">
                  Post review
                </button>
              </form>

              <div className="mt-4 space-y-3">
                {reviews.map((item, index) => (
                  <div key={`${item.date}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">{item.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2 text-sky-200">
        <span className="scale-75">{icon}</span>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}