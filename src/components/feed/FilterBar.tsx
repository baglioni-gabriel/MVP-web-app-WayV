"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { ALL_CATEGORIES } from "@/lib/types/event";

interface FilterBarProps {
  onSearch: (filters: FilterState) => void;
  isLoading?: boolean;
}

export interface FilterState {
  category: string | null;
  baseLocation: string;
  maxTravelMinutes: number;
  filterDate: string; // YYYY-MM-DD or ""
}

const TRAVEL_TIME_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1h" },
  { value: 90, label: "1h30" },
  { value: 120, label: "2h" },
];

export default function FilterBar({ onSearch, isLoading }: FilterBarProps) {
  const [category, setCategory] = useState<string | null>(null);
  const [baseLocation, setBaseLocation] = useState("");
  const [maxTravelMinutes, setMaxTravelMinutes] = useState(60);
  const [filterDate, setFilterDate] = useState("");

  function handleSearch() {
    onSearch({ category, baseLocation, maxTravelMinutes, filterDate });
  }

  function handleCategoryClick(cat: string) {
    setCategory((prev) => (prev === cat ? null : cat));
  }

  return (
    <div className="glass rounded-[var(--radius-lg)] p-4 space-y-4">
      {/* Location + Travel Time Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Location input */}
        <div className="flex-1 flex items-center gap-2 bg-surface-dark rounded-[var(--radius-md)] px-4 py-2.5 border border-white/10 focus-within:border-gold/40 transition-colors">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-gold flex-shrink-0"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <input
            type="text"
            value={baseLocation}
            onChange={(e) => setBaseLocation(e.target.value)}
            placeholder="Enter your base location…"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
        </div>

        {/* Travel time selector */}
        <div className="flex items-center gap-2 bg-surface-dark rounded-[var(--radius-md)] px-4 py-2.5 border border-white/10 min-w-[180px]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-gold flex-shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <select
            value={maxTravelMinutes}
            onChange={(e) => setMaxTravelMinutes(Number(e.target.value))}
            className="flex-1 bg-transparent text-sm text-text-primary outline-none cursor-pointer"
          >
            {TRAVEL_TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface-dark">
                🚗 Max {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-2 bg-surface-dark rounded-[var(--radius-md)] px-4 py-2.5 border border-white/10 min-w-[170px]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-gold flex-shrink-0"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text-primary outline-none cursor-pointer"
          />
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleSearch}
          isLoading={isLoading}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          Search
        </Button>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
            category === null
              ? "bg-gold text-navy-dark"
              : "bg-white/5 text-text-secondary border border-white/10 hover:border-gold/30 hover:text-gold hover:bg-gold/5"
          }`}
        >
          All
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              category === cat
                ? "bg-gold text-navy-dark"
                : "bg-white/5 text-text-secondary border border-white/10 hover:border-gold/30 hover:text-gold hover:bg-gold/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
