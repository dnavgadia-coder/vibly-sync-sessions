import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Json } from "@/integrations/supabase/types";

export interface DailyQuestion {
  id: string;
  text: string;
  emoji: string | null;
  options: string[];
  category: string | null;
  day_number: number | null;
}

export function useDailyQuestion() {
  const { user } = useAuth();
  const [question, setQuestion] = useState<DailyQuestion | null>(null);
  const [myAnswer, setMyAnswer] = useState<number | null>(null);
  const [partnerAnswered, setPartnerAnswered] = useState(false);
  const [partnerAnswer, setPartnerAnswer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      // Get profile for couple_id and streak
      const { data: prof } = await supabase
        .from("profiles")
        .select("couple_id, streak_count, last_answered_date")
        .eq("id", user.id)
        .single();

      // Determine day number based on streak or creation
      const dayNum = (prof?.streak_count ?? 0) + 1;

      // Find question for this day (cycle through available questions)
      const { data: questions } = await supabase
        .from("questions")
        .select("*")
        .order("day_number", { ascending: true });

      if (!questions || questions.length === 0) { setLoading(false); return; }

      const qIndex = (dayNum - 1) % questions.length;
      const q = questions[qIndex];
      const opts = Array.isArray(q.options)
        ? (q.options as Json[]).map((o) => String(o))
        : [];

      setQuestion({ ...q, options: opts });

      // Check if already answered today
      if (prof?.couple_id) {
        const today = new Date().toISOString().split("T")[0];
        const { data: answers } = await supabase
          .from("answers")
          .select("user_id, answer_index")
          .eq("question_id", q.id)
          .eq("couple_id", prof.couple_id);

        if (answers) {
          const mine = answers.find((a) => a.user_id === user.id);
          const theirs = answers.find((a) => a.user_id !== user.id);
          if (mine) setMyAnswer(mine.answer_index);
          if (theirs) {
            setPartnerAnswered(true);
            // Only reveal if I also answered
            if (mine) setPartnerAnswer(theirs.answer_index);
          }
        }
      }

      setLoading(false);
    };
    load();
  }, [user]);

  const submitAnswer = async (index: number, answerText: string) => {
    if (!user || !question) return;
    setSubmitting(true);

    const { data: prof } = await supabase
      .from("profiles")
      .select("couple_id")
      .eq("id", user.id)
      .single();

    const coupleId = prof?.couple_id || "solo_" + user.id;

    await supabase.from("answers").insert({
      user_id: user.id,
      question_id: question.id,
      couple_id: coupleId,
      answer_index: index,
      answer_text: answerText,
    });

    // Update streak
    const today = new Date().toISOString().split("T")[0];
    await supabase
      .from("profiles")
      .update({ last_answered_date: today, streak_count: (prof as any)?.streak_count ? (prof as any).streak_count + 1 : 1 })
      .eq("id", user.id);

    setMyAnswer(index);

    // Check if partner also answered — reveal
    if (prof?.couple_id) {
      const { data: answers } = await supabase
        .from("answers")
        .select("user_id, answer_index")
        .eq("question_id", question.id)
        .eq("couple_id", prof.couple_id);

      const theirs = answers?.find((a) => a.user_id !== user.id);
      if (theirs) {
        setPartnerAnswered(true);
        setPartnerAnswer(theirs.answer_index);
      }
    }

    setSubmitting(false);
  };

  return { question, myAnswer, partnerAnswered, partnerAnswer, loading, submitting, submitAnswer };
}
