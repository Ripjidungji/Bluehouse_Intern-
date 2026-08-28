import { Search, MapPin } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  loading,
}) {
  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl shadow-sky-950/20 backdrop-blur-xl">
        <MapPin className="ml-3 h-5 w-5 shrink-0 text-sky-200" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search a city..."
          aria-label="Search for a city"
          className="min-w-0 flex-1 bg-transparent px-1 py-3 text-white outline-none placeholder:text-slate-300"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
}