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

    // Fetch own profile
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!prof) { setLoading(false); return; }
    setProfile(prof as Profile);

    // Calculate days together
    if (prof.start_date) {
      const start = new Date(prof.start_date);
      const now = new Date();
      setDaysCount(Math.floor((now.getTime() - start.getTime()) / 86400000));
    } else if (prof.created_at) {
      const start = new Date(prof.created_at);
      const now = new Date();
      setDaysCount(Math.floor((now.getTime() - start.getTime()) / 86400000));
    }

    // Fetch partner if linked
    if (prof.partner_id) {
      const { data: partnerData } = await supabase
        .from("profiles")
        .select("name, current_mood")
        .eq("id", prof.partner_id)
        .single();
      if (partnerData) setPartner(partnerData);
    }

    // Fetch distance from couples
    if (prof.couple_id) {
      const { data: couple } = await supabase
        .from("couples")
        .select("distance_km")
        .eq("id", prof.couple_id)
        .single();
      if (couple) setDistance(couple.distance_km);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return { profile, partner, distance, daysCount, loading, refetch: fetchData };
}
