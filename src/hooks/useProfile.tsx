import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  name: string;
  partner_name: string | null;
  partner_id: string | null;
  couple_id: string | null;
  invite_code: string | null;
  invite_code_expires_at: string | null;
  streak_count: number;
  current_mood: string | null;
  start_date: string | null;
  subscription_status: string;
  location_lat: number | null;
  location_lng: number | null;
}

export interface PartnerProfile {
  name: string;
  current_mood: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [daysCount, setDaysCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) { setLoading(false); return; }

    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!prof) { setLoading(false); return; }
    setProfile(prof as Profile);

    // Clear partner & distance if no longer linked
    if (!prof.partner_id) {
      setPartner(null);
      setDistance(null);
    }
    setProfile(prof as Profile);

    // Calculate days together
    if (prof.start_date) {
      const start = new Date(prof.start_date);
      const now = new Date();
      setDaysCount(Math.max(1, Math.floor((now.getTime() - start.getTime()) / 86400000)));
    } else if (prof.created_at) {
      const start = new Date(prof.created_at);
      const now = new Date();
      setDaysCount(Math.max(1, Math.floor((now.getTime() - start.getTime()) / 86400000)));
    }

    // Fetch partner if linked
    if (prof.partner_id) {
      const { data: partnerData } = await supabase
        .from("profiles")
        .select("name, current_mood")
        .eq("id", prof.partner_id)
        .maybeSingle();
      if (partnerData) setPartner(partnerData);
    }

    // Fetch distance from couples
    if (prof.couple_id) {
      const { data: couple } = await supabase
        .from("couples")
        .select("distance_km")
        .eq("id", prof.couple_id)
        .maybeSingle();
      if (couple) setDistance(couple.distance_km);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Realtime subscription for distance updates
  useEffect(() => {
    if (!profile?.couple_id) return;

    const channel = supabase
      .channel(`couple-distance-${profile.couple_id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "couples",
          filter: `id=eq.${profile.couple_id}`,
        },
        (payload) => {
          const newDistance = (payload.new as any).distance_km;
          if (newDistance !== undefined) setDistance(newDistance);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.couple_id]);

  // Realtime subscription for partner mood updates
  useEffect(() => {
    if (!profile?.partner_id) return;

    const channel = supabase
      .channel(`partner-mood-${profile.partner_id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${profile.partner_id}`,
        },
        (payload) => {
          const p = payload.new as any;
          setPartner((prev) => prev ? { ...prev, current_mood: p.current_mood ?? prev.current_mood } : prev);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.partner_id]);

  return { profile, partner, distance, daysCount, loading, refetch: fetchData };
}
