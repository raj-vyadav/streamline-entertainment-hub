import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SocialChat from "@/components/SocialChat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Play, Users, ArrowLeft, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import nexusImg from "@/assets/nexus-chronicles.jpg";
import echoesImg from "@/assets/echoes-eternity.jpg";
import shadowImg from "@/assets/shadow-protocol.jpg";
import cityImg from "@/assets/city-of-stars.jpg";
import deepImg from "@/assets/deep-blue.jpg";
import hollowImg from "@/assets/the-hollow.jpg";
import featuredBanner from "@/assets/featured-banner.jpg";

const imageMap: Record<string, string> = {
  "nexus-chronicles": nexusImg,
  "echoes-eternity": echoesImg,
  "shadow-protocol": shadowImg,
  "city-of-stars": cityImg,
  "deep-blue": deepImg,
  "the-hollow": hollowImg,
};

interface PartyData {
  id: string;
  title: string;
  party_type: string;
  status: string;
  content_id: string;
  content?: { title: string; slug: string; image: string | null; video_url: string | null };
}

const WatchParty = () => {
  const { partyId } = useParams();
  const { user } = useAuth();
  const [party, setParty] = useState<PartyData | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!partyId) return;

    const fetchParty = async () => {
      const { data } = await supabase
        .from("watch_parties")
        .select("id, title, party_type, status, content_id, content(title, slug, image, video_url)")
        .eq("id", partyId)
        .single();

      if (data) setParty(data as any);
      setLoading(false);
    };

    const fetchMembers = async () => {
      const { count } = await supabase
        .from("watch_party_members")
        .select("id", { count: "exact", head: true })
        .eq("party_id", partyId);
      setMemberCount(count || 0);
    };

    const checkJoined = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("watch_party_members")
        .select("id")
        .eq("party_id", partyId)
        .eq("user_id", user.id)
        .maybeSingle();
      setJoined(!!data);
    };

    fetchParty();
    fetchMembers();
    checkJoined();

    // Realtime member count
    const channel = supabase
      .channel(`party-members-${partyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "watch_party_members", filter: `party_id=eq.${partyId}` }, () => {
        fetchMembers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [partyId, user]);

  const handleJoin = async () => {
    if (!user || !partyId) {
      toast.error("Sign in to join the party");
      return;
    }
    await supabase.from("watch_party_members").insert({ party_id: partyId, user_id: user.id });
    setJoined(true);
    toast.success("You joined the party!");
  };

  const handleLeave = async () => {
    if (!user || !partyId) return;
    await supabase.from("watch_party_members").delete().eq("party_id", partyId).eq("user_id", user.id);
    setJoined(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <p className="text-muted-foreground">Loading party...</p>
        </div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Party not found</p>
          <Link to="/browse">
            <Button variant="outline">Browse Content</Button>
          </Link>
        </div>
      </div>
    );
  }

  const contentImage = party.content?.image ? imageMap[party.content.image] || featuredBanner : featuredBanner;
  const videoUrl = (party.content as any)?.video_url;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        {/* Video area */}
        <div className="relative aspect-video max-h-[60vh] w-full overflow-hidden bg-card">
          {isPlaying && videoUrl ? (
            <video src={videoUrl} controls autoPlay className="h-full w-full object-contain bg-black" />
          ) : (
            <>
              <img src={contentImage} alt={party.content?.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => videoUrl ? setIsPlaying(true) : toast.info("No video available")}
                  className="h-20 w-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg cursor-pointer"
                >
                  <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
                </motion.button>
              </div>
            </>
          )}

          {/* Party badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/90">
            {party.party_type === "global" ? <Globe className="h-3.5 w-3.5 text-primary-foreground" /> : <Lock className="h-3.5 w-3.5 text-primary-foreground" />}
            <span className="text-xs font-semibold text-primary-foreground">
              {party.party_type === "global" ? "Global" : "Private"} Party
            </span>
          </div>

          {/* Member count */}
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full glass">
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            <Users className="h-3.5 w-3.5 text-foreground" />
            <span className="text-xs font-medium text-foreground">{memberCount} watching</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Party Info */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Link to={`/watch/${party.content?.slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
                <ArrowLeft className="h-4 w-4" /> Back to {party.content?.title}
              </Link>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">{party.title}</h1>
              <p className="text-sm text-muted-foreground mb-4">
                Watching <span className="text-foreground font-medium">{party.content?.title}</span> together
              </p>

              {!joined ? (
                <Button onClick={handleJoin} variant="hero">
                  <Users className="h-4 w-4 mr-2" /> Join Watch Party
                </Button>
              ) : (
                <div className="flex gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                    <Users className="h-4 w-4" /> You're in the party
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLeave} className="text-muted-foreground hover:text-destructive">
                    Leave
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Live Chat */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Live Chat</h3>
              </div>
              <SocialChat contentId={party.content_id} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchParty;
