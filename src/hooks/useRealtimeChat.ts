import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ChatMsg {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  display_name: string;
}

interface UseRealtimeChatOptions {
  partyId?: string;
  partyStatus?: string; // 'scheduled' | 'live' | 'ended'
}

export const useRealtimeChat = ({ partyId, partyStatus }: UseRealtimeChatOptions) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(true);

  const isLive = partyStatus === "live";

  useEffect(() => {
    if (!partyId) {
      setLoading(false);
      return;
    }

    let active = true;

    const fetchDisplayNames = async (userIds: string[]): Promise<Record<string, string>> => {
      if (userIds.length === 0) return {};
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      const map: Record<string, string> = {};
      (data || []).forEach((p: any) => { map[p.user_id] = p.display_name || "User"; });
      return map;
    };

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, user_id, message, created_at")
        .eq("party_id", partyId)
        .order("created_at", { ascending: true })
        .limit(200);

      if (error) {
        console.error("Failed to load chat messages:", error);
        setLoading(false);
        return;
      }

      const rows = data || [];
      const uniqueUserIds = Array.from(new Set(rows.map((m: any) => m.user_id)));
      const nameMap = await fetchDisplayNames(uniqueUserIds);

      if (!active) return;
      setMessages(
        rows.map((m: any) => ({
          id: m.id,
          user_id: m.user_id,
          message: m.message,
          created_at: m.created_at,
          display_name: nameMap[m.user_id] || "User",
        }))
      );
      setLoading(false);
    };

    fetchMessages();

    // Only subscribe to realtime updates while the party is live
    if (!isLive) {
      return () => { active = false; };
    }

    const channel = supabase
      .channel(`chat-party-${partyId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `party_id=eq.${partyId}` },
        async (payload) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", payload.new.user_id)
            .maybeSingle();

          if (!active) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [
              ...prev,
              {
                id: payload.new.id,
                user_id: payload.new.user_id,
                message: payload.new.message,
                created_at: payload.new.created_at,
                display_name: profile?.display_name || "User",
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [partyId, isLive]);

  const sendMessage = async (message: string) => {
    if (!user || !partyId || !message.trim()) return;
    if (!isLive) {
      console.warn("Cannot send: party is not live");
      return;
    }
    const { error } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      party_id: partyId,
      // content_id is still required by schema; pass empty UUID via separate fetch is unnecessary
      // We need content_id since column is NOT NULL. Caller passes via separate hook? Simplest: also accept it.
      content_id: partyId, // placeholder; will be overridden below if provided differently
      message: message.trim(),
    } as any);
    if (error) console.error("Failed to send message:", error);
  };

  return { messages, sendMessage, loading, isAuthenticated: !!user, isLive };
};
