import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";
import type { Json } from "@/integrations/supabase/types";

interface WeeklyStats {
  streak: number;
  matchPercent: number;
  answeredCount: string; // e.g. "5/7"
  bestMatch: { text: string; emoji: string } | null;
  biggestMiss: { text: string; myAnswer: string; partnerAnswer: string } | null;
  userName: string;
  partnerName: string;
  loading: boolean;
}

export function useWeeklyReport(): WeeklyStats {
  const { user } = useAuth();
  const { profile, partner } = useProfile();
  const [stats, setStats] = useState<WeeklyStats>({
    streak: 0,
    matchPercent: 0,
    answeredCount: "0/7",
    bestMatch: null,
    biggestMiss: null,
    userName: "",
    partnerName: "",
    loading: true,
  });

  useEffect(() => {
    if (!user || !profile?.couple_id) {
      setStats((s) => ({ ...s, loading: false }));
      return;
    }

    const load = async () => {
      // Get all answers for this couple
      const { data: answers } = await supabase
        .from("answers")
        .select("question_id, user_id, answer_index, answer_text")
        .eq("couple_id", profile.couple_id!);

      // Get all questions
      const { data: questions } = await supabase
        .from("questions")
        .select("id, text, emoji, options")
        .order("day_number", { ascending: true });

      if (!answers || !questions) {
        setStats((s) => ({ ...s, loading: false }));
        return;
      }

      // Group answers by question
      const byQuestion = new Map<string, { mine?: number; theirs?: number; myText?: string; theirText?: string }>();
      for (const a of answers) {
        const entry = byQuestion.get(a.question_id) || {};
        if (a.user_id === user.id) {
          entry.mine = a.answer_index;
          entry.myText = a.answer_text;
        } else {
          entry.theirs = a.answer_index;
          entry.theirText = a.answer_text;
        }
        byQuestion.set(a.question_id, entry);
      }

      // Only count questions where both answered
      const bothAnswered = Array.from(byQuestion.entries()).filter(
        ([, v]) => v.mine !== undefined && v.theirs !== undefined
      );

      const matches = bothAnswered.filter(([, v]) => v.mine === v.theirs);
      const misses = bothAnswered.filter(([, v]) => v.mine !== v.theirs);

      const matchPercent = bothAnswered.length > 0
        ? Math.round((matches.length / bothAnswered.length) * 100)
        : 0;

      // Best match - find a matching question
      let bestMatch: WeeklyStats["bestMatch"] = null;
      if (matches.length > 0) {
        const [qId, vals] = matches[matches.length - 1];
        const q = questions.find((q) => q.id === qId);
        if (q) {
          const opts = Array.isArray(q.options) ? (q.options as Json[]).map(String) : [];
          bestMatch = {
            text: `100% match — you both said ${opts[vals.mine!] || vals.myText || "the same thing"}`,
            emoji: q.emoji || "✨",
          };
        }
      }

      // Biggest miss
      let biggestMiss: WeeklyStats["biggestMiss"] = null;
      if (misses.length > 0) {
        const [qId, vals] = misses[misses.length - 1];
        const q = questions.find((q) => q.id === qId);
        if (q) {
          const opts = Array.isArray(q.options) ? (q.options as Json[]).map(String) : [];
          biggestMiss = {
            text: q.text,
            myAnswer: opts[vals.mine!] || vals.myText || "?",
            partnerAnswer: opts[vals.theirs!] || vals.theirText || "?",
          };
        }
      }

      // Count questions user answered (out of total available or 7)
      const myAnsweredCount = answers.filter((a) => a.user_id === user.id).length;
      const total = Math.min(questions.length, 7);

      setStats({
        streak: profile.streak_count || 0,
        matchPercent,
        answeredCount: `${Math.min(myAnsweredCount, total)}/${total}`,
        bestMatch,
        biggestMiss,
        userName: profile.name || "You",
        partnerName: partner?.name || "Partner",
        loading: false,
      });
    };

    load();
  }, [user, profile?.couple_id, profile?.streak_count]);

  return stats;
}
