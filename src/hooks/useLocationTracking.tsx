import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Minimum distance change (km) to trigger an update — avoids noisy GPS jitter
const MIN_MOVE_THRESHOLD_KM = 0.05; // 50 meters
// Minimum time between DB writes (ms) — battery-friendly
const MIN_UPDATE_INTERVAL_MS = 60_000; // 1 minute

export function useLocationTracking() {
  const { user } = useAuth();
  const lastLat = useRef<number | null>(null);
  const lastLng = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);

  const updateLocation = useCallback(
    async (lat: number, lng: number) => {
      if (!user) return;

      const now = Date.now();

      // Throttle: skip if too soon since last write
      if (now - lastUpdateTime.current < MIN_UPDATE_INTERVAL_MS) return;

      // Jitter filter: skip if movement is negligible
      if (lastLat.current !== null && lastLng.current !== null) {
        const moved = haversineKm(lastLat.current, lastLng.current, lat, lng);
        if (moved < MIN_MOVE_THRESHOLD_KM) return;
      }

      lastLat.current = lat;
      lastLng.current = lng;
      lastUpdateTime.current = now;

      // Update own location
      await supabase
        .from("profiles")
        .update({
          location_lat: lat,
          location_lng: lng,
          location_updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      // Fetch couple info
      const { data: prof } = await supabase
        .from("profiles")
        .select("couple_id, partner_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!prof?.partner_id || !prof?.couple_id) return;

      // Fetch partner location
      const { data: partner } = await supabase
        .from("profiles")
        .select("location_lat, location_lng")
        .eq("id", prof.partner_id)
        .maybeSingle();

      if (!partner?.location_lat || !partner?.location_lng) return;

      const dist = haversineKm(lat, lng, partner.location_lat, partner.location_lng);

      await supabase
        .from("couples")
        .update({
          distance_km: Math.round(dist * 100) / 100,
          distance_updated_at: new Date().toISOString(),
        })
        .eq("id", prof.couple_id);
    },
    [user]
  );

  useEffect(() => {
    if (!user) return;
    if (!navigator.geolocation) return;

    // Initial high-accuracy position
    navigator.geolocation.getCurrentPosition(
      (pos) => updateLocation(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );

    // Watch for significant changes — battery-efficient with maximumAge
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => updateLocation(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 120000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [user, updateLocation]);
}
