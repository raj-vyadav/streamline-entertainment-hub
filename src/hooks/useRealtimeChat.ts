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

export const useRealtimeChat = (contentId: string | undefined) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contentId) return;

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

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, user_id, message, created_at")
        .eq("content_id", contentId)
        .order("created_at", { ascending: true })
        .limit(50);

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

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${contentId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `content_id=eq.${contentId}` },
        async (payload) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", payload.new.user_id)
            .maybeSingle();

          if (!active) return;
          setMessages((prev) => {
            // Avoid duplicates if message already added optimistically or via re-fetch
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
  }, [contentId]);

  const sendMessage = async (message: string) => {
    if (!user || !contentId || !message.trim()) return;
    const { error } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      content_id: contentId,
      message: message.trim(),
    });
    if (error) console.error("Failed to send message:", error);
  };

  return { messages, sendMessage, loading, isAuthenticated: !!user };
};
