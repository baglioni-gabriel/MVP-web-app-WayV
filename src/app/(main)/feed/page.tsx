"use client";

import { useState, useEffect, useCallback } from "react";
import { getRecentEvents } from "@/lib/firebase/firestore";
import { geocodeAddress, fetchTravelTimes } from "@/lib/maps/geocode";
import { isOpenOnDay } from "@/lib/utils/operatingHours";
import EventCard from "@/components/feed/EventCard";
import FilterBar, { type FilterState } from "@/components/feed/FilterBar";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type { WayvEvent } from "@/lib/types/event";

export default function FeedPage() {
  const [events, setEvents] = useState<WayvEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Filter state
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string>("");
  const [travelTimes, setTravelTimes] = useState<Record<string, number>>({});
  const [maxTravel, setMaxTravel] = useState<number>(0); // 0 = no filter

  const fetchEvents = useCallback(async () => {
    try {
      const result = await getRecentEvents(50);
      setEvents(result);
    } catch (err) {
      console.error("Failed to load feed:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchEvents().finally(() => setLoading(false));
  }, [fetchEvents]);

  // Pull-to-refresh
  async function handleRefresh() {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }

  // Handle filter search
  async function handleSearch(filters: FilterState) {
    setActiveCategory(filters.category);
    setActiveDate(filters.filterDate);
    setMaxTravel(filters.maxTravelMinutes);

    // If base location is provided, geocode and fetch travel times
    if (filters.baseLocation.trim()) {
      setSearchLoading(true);
      try {
        const coords = await geocodeAddress(filters.baseLocation);
        if (coords) {
          // Get events with valid coordinates
          const destinations = events
            .filter((e) => e.location.lat !== 0 && e.location.lng !== 0)
            .map((e) => ({
              lat: e.location.lat,
              lng: e.location.lng,
              eventId: e.id,
            }));

          const times = await fetchTravelTimes(coords, destinations);
          setTravelTimes(times);
        } else {
          // Couldn't geocode — clear travel times
          setTravelTimes({});
        }
      } catch {
        setTravelTimes({});
      } finally {
        setSearchLoading(false);
      }
    } else {
      setTravelTimes({});
    }
  }

  // ── Apply filters ──
  const filteredEvents = events.filter((event) => {
    // Category filter
    if (activeCategory && event.category !== activeCategory) {
      return false;
    }

    // Date-based operating hours filter
    if (activeDate) {
      const date = new Date(activeDate + "T12:00:00"); // midday
      const isOpen = isOpenOnDay(
        event.operatingHours,
        event.unavailableDays,
        date
      );
      if (!isOpen) return false;
    }

    // Travel time filter (only if we have travel times computed)
    if (maxTravel > 0 && Object.keys(travelTimes).length > 0) {
      const time = travelTimes[event.id];
      // If no travel time data for this event (no coords), include it
      if (time !== undefined && time > maxTravel) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <section className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Explore <span className="gradient-text">Experiences</span>
            </h1>
            <p className="text-sm text-text-secondary">
              Discover authentic local events near you
            </p>
          </div>

          {/* Pull-to-refresh button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            isLoading={refreshing}
            className="flex-shrink-0"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={refreshing ? "animate-spin" : ""}
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10" />
              <path d="M20.49 15a9 9 0 01-14.85 3.36L1 14" />
            </svg>
            Refresh
          </Button>
        </div>

        {/* Filter Bar */}
        <FilterBar onSearch={handleSearch} isLoading={searchLoading} />
      </section>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-sm text-text-muted animate-pulse">
              Loading events…
            </p>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-text-muted mb-4"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <h2 className="text-lg font-bold text-text-primary mb-1">
            No events found
          </h2>
          <p className="text-sm text-text-muted max-w-sm">
            {activeCategory || activeDate
              ? "Try adjusting your filters or searching a different date."
              : "No events have been posted yet. Be the first!"}
          </p>
          {(activeCategory || activeDate) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setActiveCategory(null);
                setActiveDate("");
                setTravelTimes({});
                setMaxTravel(0);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-muted">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "event" : "events"} found
              {activeCategory && (
                <span className="text-gold"> in {activeCategory}</span>
              )}
              {activeDate && (
                <span className="text-gold"> open on {activeDate}</span>
              )}
            </p>
          </div>

          {/* Events Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                travelTimeMinutes={travelTimes[event.id]}
                animationDelay={i * 60}
              />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
