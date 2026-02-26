import { useEffect } from "react";
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

export function useLocationTracking() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Update own location
        await supabase
          .from("profiles")
          .update({
            location_lat: lat,
            location_lng: lng,
            location_updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        // Fetch own profile to get couple_id & partner_id
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

        // Update couple distance
        await supabase
          .from("couples")
          .update({
            distance_km: Math.round(dist * 100) / 100,
            distance_updated_at: new Date().toISOString(),
          })
          .eq("id", prof.couple_id);
      },
      () => {
        // User denied or error — silently ignore
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [user]);
}
