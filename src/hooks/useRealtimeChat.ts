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

    // Fetch existing messages with profile join
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, user_id, message, created_at, profiles(display_name)")
        .eq("content_id", contentId)
        .order("created_at", { ascending: true })
        .limit(50);

      if (data) {
        setMessages(
          data.map((m: any) => ({
            id: m.id,
            user_id: m.user_id,
            message: m.message,
            created_at: m.created_at,
            display_name: m.profiles?.display_name || "User",
          }))
        );
      }
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
            .single();

          setMessages((prev) => [
            ...prev,
            {
              id: payload.new.id,
              user_id: payload.new.user_id,
              message: payload.new.message,
              created_at: payload.new.created_at,
              display_name: profile?.display_name || "User",
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentId]);

  const sendMessage = async (message: string) => {
    if (!user || !contentId || !message.trim()) return;
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      content_id: contentId,
      message: message.trim(),
    });
  };

  return { messages, sendMessage, loading, isAuthenticated: !!user };
};
