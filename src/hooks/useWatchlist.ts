import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useWatchlist = (contentId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !contentId) return;
    supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("content_id", contentId)
      .maybeSingle()
      .then(({ data }) => setIsInWatchlist(!!data));
  }, [user, contentId]);

  const toggle = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to add to your watchlist.", variant: "destructive" });
      return;
    }
    if (!contentId) return;
    setLoading(true);
    if (isInWatchlist) {
      await supabase.from("watchlist").delete().eq("user_id", user.id).eq("content_id", contentId);
      setIsInWatchlist(false);
      toast({ title: "Removed from watchlist" });
    } else {
      await supabase.from("watchlist").insert({ user_id: user.id, content_id: contentId });
      setIsInWatchlist(true);
      toast({ title: "Added to watchlist" });
    }
    setLoading(false);
  };

  return { isInWatchlist, toggle, loading };
};
