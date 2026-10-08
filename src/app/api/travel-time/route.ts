import { NextRequest, NextResponse } from "next/server";

interface Destination {
  lat: number;
  lng: number;
  eventId: string;
}

interface TravelTimeRequest {
  origin: { lat: number; lng: number };
  destinations: Destination[];
}

interface RouteMatrixElement {
  originIndex: number;
  destinationIndex: number;
  duration?: string; // e.g. "1234s"
  status?: { code: number };
}

/**
 * POST /api/travel-time
 * Calls Google Routes API computeRouteMatrix to get driving durations.
 * Returns: { results: { eventId: string, durationMinutes: number }[] }
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps API key not configured" },
      { status: 500 }
    );
  }

  let body: TravelTimeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { origin, destinations } = body;
  if (!origin || !destinations || destinations.length === 0) {
    return NextResponse.json(
      { error: "origin and destinations are required" },
      { status: 400 }
    );
  }

  // Cap at 25 destinations per request (Routes API limit)
  const capped = destinations.slice(0, 25);

  try {
    const response = await fetch(
      "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "originIndex,destinationIndex,duration",
        },
        body: JSON.stringify({
          origins: [
            {
              waypoint: {
                location: {
                  latLng: {
                    latitude: origin.lat,
                    longitude: origin.lng,
                  },
                },
              },
            },
          ],
          destinations: capped.map((d) => ({
            waypoint: {
              location: {
                latLng: {
                  latitude: d.lat,
                  longitude: d.lng,
                },
              },
            },
          })),
          travelMode: "DRIVE",
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Routes API error:", response.status, text);
      return NextResponse.json(
        { error: "Routes API request failed", detail: text },
        { status: response.status }
      );
    }

    const data: RouteMatrixElement[] = await response.json();

    const results = data
      .filter((el) => el.duration)
      .map((el) => {
        const durationSeconds = parseInt(
          (el.duration || "0").replace("s", ""),
          10
        );
        return {
          eventId: capped[el.destinationIndex]?.eventId || "",
          durationMinutes: Math.round(durationSeconds / 60),
        };
      })
      .filter((r) => r.eventId);

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Travel time error:", err);
    return NextResponse.json(
      { error: "Failed to compute travel times" },
      { status: 500 }
    );
  }
}
