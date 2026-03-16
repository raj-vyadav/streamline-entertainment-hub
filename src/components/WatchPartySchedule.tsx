import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Film, Users } from "lucide-react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { Link } from "react-router-dom";

interface WatchParty {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
  content_id: string;
  content?: { title: string; slug: string; image: string | null };
}

const WatchPartySchedule = () => {
  const [parties, setParties] = useState<WatchParty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParties = async () => {
      const { data } = await supabase
        .from("watch_parties")
        .select("id, title, scheduled_at, status, content_id, content(title, slug, image)")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(5);

      if (data) setParties(data as any);
      setLoading(false);
    };
    fetchParties();

    const channel = supabase
      .channel("watch-parties-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "watch_parties" }, () => {
        fetchParties();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading || parties.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl glass p-6 space-y-4"
    >
      <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        Upcoming Watch Parties
      </h3>

      <div className="space-y-3">
        {parties.map((party) => (
          <Link
            key={party.id}
            to={`/watch/${party.content?.slug || ""}`}
            className="block rounded-xl bg-secondary/50 hover:bg-secondary transition-colors p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{party.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Film className="h-3 w-3" />
                  {party.content?.title}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-primary font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(party.scheduled_at), "MMM d")}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {format(new Date(party.scheduled_at), "h:mm a")}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-primary/70 mt-1">
              Starts {formatDistanceToNow(new Date(party.scheduled_at), { addSuffix: true })}
            </p>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default WatchPartySchedule;
