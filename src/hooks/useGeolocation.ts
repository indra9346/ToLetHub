import { useState, useEffect, useCallback, useRef } from "react";

interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  loading: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  isTracking: boolean;
}

const POSITION_CACHE_KEY = "tolethub-last-position";

const cachePosition = (pos: GeoPosition) => {
  try {
    localStorage.setItem(POSITION_CACHE_KEY, JSON.stringify(pos));
  } catch {}
};

const getCachedPosition = (): GeoPosition | null => {
  try {
    const raw = localStorage.getItem(POSITION_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useGeolocation = (): UseGeolocationReturn => {
  const [position, setPosition] = useState<GeoPosition | null>(getCachedPosition);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    // Stop existing watch first
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setLoading(true);
    setError(null);

    // First try getCurrentPosition for a quick fix
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: GeoPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        };
        setPosition(p);
        cachePosition(p);
        setLoading(false);
        setIsTracking(true);
      },
      () => {
        // If getCurrentPosition fails, use cached position as fallback
        const cached = getCachedPosition();
        if (cached) {
          setPosition(cached);
          setIsTracking(true);
          setLoading(false);
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );

    // Then watch for high-accuracy updates
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const p: GeoPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        };
        setPosition(p);
        cachePosition(p);
        setLoading(false);
        setIsTracking(true);
        setError(null);
      },
      (err) => {
        const cached = getCachedPosition();
        if (cached && !position) {
          setPosition(cached);
          setIsTracking(true);
        }
        if (!position && !cached) {
          setError(
            err.code === 1
              ? "Location access denied. Please enable location permissions."
              : err.code === 2
              ? "Location unavailable. Check your GPS or try outdoors."
              : "Location timed out. Using last known location if available."
          );
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 5000,
      }
    );

    watchIdRef.current = id;
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { position, error, loading, startTracking, stopTracking, isTracking };
};

/** Calculate distance between two points in km using Haversine formula */
export const getDistanceKm = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
