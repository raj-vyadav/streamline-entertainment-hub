import { useState, useEffect, useCallback } from "react";
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
  contentId?: string;
  partyStatus?: string; // 'scheduled' | 'live' | 'ended'
}

export const useRealtimeChat = ({ partyId, contentId, partyStatus }: UseRealtimeChatOptions) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(true);

  const isLive = partyStatus === "live";

  const fetchDisplayNames = useCallback(async (userIds: string[]): Promise<Record<string, string>> => {
    if (userIds.length === 0) return {};

    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);

    const map: Record<string, string> = {};
    (data || []).forEach((profile: any) => {
      map[profile.user_id] = profile.display_name || "User";
    });
    return map;
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!partyId) {
      setMessages([]);
      setLoading(false);
      return;
    }

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
    const uniqueUserIds = Array.from(new Set(rows.map((message: any) => message.user_id)));
    const nameMap = await fetchDisplayNames(uniqueUserIds);

    setMessages(
      rows.map((message: any) => ({
        id: message.id,
        user_id: message.user_id,
        message: message.message,
        created_at: message.created_at,
        display_name: nameMap[message.user_id] || "User",
      }))
    );
    setLoading(false);
  }, [fetchDisplayNames, partyId]);

  useEffect(() => {
    if (!partyId) {
      setLoading(false);
      return;
    }

    let active = true;
    let pollingId: number | undefined;

    const loadMessages = async () => {
      if (!active) return;
      await fetchMessages();
    };

    loadMessages();

    if (!isLive) {
      return () => {
        active = false;
      };
    }

    const startPollingFallback = () => {
      if (pollingId) return;
      pollingId = window.setInterval(() => {
        void loadMessages();
      }, 2500);
    };

    const stopPollingFallback = () => {
      if (!pollingId) return;
      window.clearInterval(pollingId);
      pollingId = undefined;
    };

    const channel = supabase
      .channel(`chat-party-${partyId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        async (payload) => {
          if (!active || payload.new.party_id !== partyId) return;

          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", payload.new.user_id)
            .maybeSingle();

          if (!active) return;
          setMessages((prev) => {
            if (prev.some((message) => message.id === payload.new.id)) return prev;
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
      .subscribe((status) => {
        console.log(`[chat realtime] party=${partyId} status=${status}`);

        if (status === "SUBSCRIBED") {
          stopPollingFallback();
          return;
        }

        if (status === "TIMED_OUT" || status === "CHANNEL_ERROR" || status === "CLOSED") {
          startPollingFallback();
        }
      });

    startPollingFallback();

    return () => {
      active = false;
      stopPollingFallback();
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, isLive, partyId]);

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim();

    if (!user || !partyId || !contentId || !trimmedMessage) return;
    if (!isLive) {
      console.warn("Cannot send: party is not live");
      return;
    }

    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMsg = {
      id: optimisticId,
      user_id: user.id,
      message: trimmedMessage,
      created_at: new Date().toISOString(),
      display_name: user.user_metadata?.display_name || "You",
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        user_id: user.id,
        party_id: partyId,
        content_id: contentId,
        message: trimmedMessage,
      })
      .select("id, user_id, message, created_at")
      .single();

    if (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
      return;
    }

    setMessages((prev) => {
      const withoutOptimistic = prev.filter((msg) => msg.id !== optimisticId);
      if (withoutOptimistic.some((msg) => msg.id === data.id)) return withoutOptimistic;

      return [
        ...withoutOptimistic,
        {
          id: data.id,
          user_id: data.user_id,
          message: data.message,
          created_at: data.created_at,
          display_name: user.user_metadata?.display_name || "You",
        },
      ];
    });
  };

  return { messages, sendMessage, loading, isAuthenticated: !!user, isLive };
};
