/**
 * Geocode an address string to lat/lng coordinates using Google Geocoding API.
 * Uses the public (NEXT_PUBLIC) key since this runs client-side.
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("Google Maps API key not configured for geocoding");
    return null;
  }

  try {
    const encoded = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${apiKey}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.status !== "OK" || !data.results?.length) {
      return null;
    }

    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}

/**
 * Fetch travel times from origin to multiple event destinations.
 * Calls our server-side proxy to keep the API key safe.
 */
export async function fetchTravelTimes(
  origin: { lat: number; lng: number },
  destinations: { lat: number; lng: number; eventId: string }[]
): Promise<Record<string, number>> {
  if (destinations.length === 0) return {};

  try {
    const response = await fetch("/api/travel-time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destinations }),
    });

    if (!response.ok) return {};

    const data = await response.json();
    const map: Record<string, number> = {};

    for (const result of data.results || []) {
      map[result.eventId] = result.durationMinutes;
    }

    return map;
  } catch {
    return {};
  }
}
