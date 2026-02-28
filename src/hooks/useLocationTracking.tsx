import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { createNotificationForUser } from "./useNotifications";

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
const UPDATE_INTERVAL_FAR_MS = 60_000; // 1 minute when far
const UPDATE_INTERVAL_CLOSE_MS = 20_000; // 20s when close (< 10 km) for accurate progress
const CLOSE_NOTIFICATION_THRESHOLD_KM = 1; // Notify partner when distance drops below this
const CLOSE_NOTIFICATION_COOLDOWN_MS = 2 * 60 * 60 * 1000; // Max once per 2 hours

export function useLocationTracking() {
  const { user } = useAuth();
  const lastLat = useRef<number | null>(null);
  const lastLng = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const nextIntervalMs = useRef<number>(UPDATE_INTERVAL_FAR_MS);
  const watchIdRef = useRef<number | null>(null);
  const lastCloseNotifyTime = useRef<number>(0);

  const updateLocation = useCallback(
    async (lat: number, lng: number) => {
      if (!user) return;

      const now = Date.now();

      // Throttle: use shorter interval when couple is close for more accurate updates
      if (now - lastUpdateTime.current < nextIntervalMs.current) return;

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
      const distKm = dist < 0.1 ? Math.round(dist * 10000) / 10000 : Math.round(dist * 100) / 100;

      await supabase
        .from("couples")
        .update({
          distance_km: distKm,
          distance_updated_at: new Date().toISOString(),
        })
        .eq("id", prof.couple_id);

      if (dist < CLOSE_NOTIFICATION_THRESHOLD_KM && now - lastCloseNotifyTime.current > CLOSE_NOTIFICATION_COOLDOWN_MS) {
        lastCloseNotifyTime.current = now;
        const distText = dist < 0.001 ? "under 1 m" : dist < 0.1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
        createNotificationForUser(
          prof.partner_id,
          "couple_close",
          "You're getting close! 🫂",
          `You're only ${distText} apart. Open the app to see your distance.`,
          { distance_km: distKm }
        ).catch(() => {});
      }

      if (dist < 0.05) nextIntervalMs.current = 10_000;
      else if (dist < 10) nextIntervalMs.current = UPDATE_INTERVAL_CLOSE_MS;
      else nextIntervalMs.current = UPDATE_INTERVAL_FAR_MS;
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

    // Watch for changes; when couple is close use higher accuracy and more frequent updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => updateLocation(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [user, updateLocation]);
}
