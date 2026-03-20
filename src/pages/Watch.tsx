import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ContentRow from "@/components/ContentRow";
import { contentLibrary } from "@/lib/content-data";
import { supabase } from "@/integrations/supabase/client";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Play, Star, Clock, Calendar, Sparkles, Share2, Plus, Check, Monitor, Smartphone, Tv, Users, Globe } from "lucide-react";
import ContentRating from "@/components/ContentRating";
import CreatePartyDialog from "@/components/CreatePartyDialog";
import { Button } from "@/components/ui/button";

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

const Watch = () => {
  const { id } = useParams();
  const content = contentLibrary.find((c) => c.id === id) || contentLibrary[0];
  const [dbContentId, setDbContentId] = useState<string | undefined>();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();
  const { isInWatchlist, toggle: toggleWatchlist, loading: watchlistLoading } = useWatchlist(dbContentId);

  useEffect(() => {
    const fetchContentId = async () => {
      const { data } = await supabase
        .from("content")
        .select("id, video_url")
        .eq("slug", id || "")
        .single();
      if (data) {
        setDbContentId(data.id);
        setVideoUrl(data.video_url);
      }
    };
    fetchContentId();
    setIsPlaying(false);
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Video Player Area */}
      <div className="pt-16">
        <div className="relative aspect-video max-h-[70vh] w-full overflow-hidden bg-card">
          {isPlaying && videoUrl ? (
            <video src={videoUrl} controls autoPlay className="h-full w-full object-contain bg-black" />
          ) : (
            <>
              <img src={imageMap[content.image] || featuredBanner} alt={content.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (videoUrl) setIsPlaying(true);
                    else alert("No video available for this content.");
                  }}
                  className="h-20 w-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg cursor-pointer"
                  style={{ boxShadow: "var(--shadow-glow-strong)" }}
                >
                  <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
                </motion.button>
              </div>

              {content.viewers && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full glass">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-xs font-medium text-foreground">{content.viewers.toLocaleString()} watching</span>
                </div>
              )}

              {content.isAIPowered && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                  <span className="text-xs font-semibold text-primary-foreground">AI-Powered Story</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3">{content.title}</h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-primary" fill="currentColor" />{content.rating}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {content.year}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {content.duration}</span>
                {content.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full bg-secondary text-xs text-secondary-foreground">{tag}</span>
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">{content.description}</p>

              <div className="flex flex-wrap gap-3">
                <Button variant="hero">
                  <Play className="h-4 w-4 mr-2" fill="currentColor" />
                  Resume Watching
                </Button>
                <Button variant="ghost-glow" size="icon" onClick={toggleWatchlist} disabled={watchlistLoading} className={isInWatchlist ? "text-primary" : ""}>
                  {isInWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
                <Button variant="ghost-glow" size="icon"><Share2 className="h-4 w-4" /></Button>
              </div>
            </motion.div>

            {/* Ratings & Reviews */}
            <ContentRating contentId={dbContentId} />

            {/* Cross-Device */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl glass p-6">
              <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />Cross-Device Fluidity
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Continue watching seamlessly on any device. Your progress is always synced.</p>
              <div className="flex gap-4">
                {[{ icon: Smartphone, label: "Phone" }, { icon: Monitor, label: "Desktop" }, { icon: Tv, label: "Smart TV" }].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar: Watch Party Options */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="rounded-2xl glass p-6 space-y-4">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Watch Together
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create a watch party and enjoy this content with friends or the community.
                </p>

                <div className="space-y-3">
                  <CreatePartyDialog contentId={dbContentId} contentTitle={content.title}>
                    <Button className="w-full justify-start gap-3" variant="outline">
                      <Globe className="h-4 w-4 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Global Watch Party</p>
                        <p className="text-[10px] text-muted-foreground">Open to everyone · Live chat</p>
                      </div>
                    </Button>
                  </CreatePartyDialog>

                  <CreatePartyDialog contentId={dbContentId} contentTitle={content.title}>
                    <Button className="w-full justify-start gap-3" variant="outline">
                      <Users className="h-4 w-4 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Local Watch Party</p>
                        <p className="text-[10px] text-muted-foreground">Private link · Invite friends</p>
                      </div>
                    </Button>
                  </CreatePartyDialog>
                </div>
              </div>

              {/* Active Global Parties for this content */}
              <ActiveParties contentId={dbContentId} />
            </motion.div>
          </div>
        </div>

        {/* More Like This */}
        <div className="mt-12">
          <ContentRow title="More Like This" items={contentLibrary.filter((c) => c.id !== content.id)} />
        </div>
      </div>
    </div>
  );
};

// Sub-component: show active global parties for this content
const ActiveParties = ({ contentId }: { contentId?: string }) => {
  const [parties, setParties] = useState<any[]>([]);

  useEffect(() => {
    if (!contentId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("watch_parties")
        .select("id, title, party_type, status")
        .eq("content_id", contentId)
        .eq("status", "live")
        .eq("party_type", "global")
        .limit(5);
      if (data) setParties(data);
    };
    fetch();

    const channel = supabase
      .channel(`active-parties-${contentId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "watch_parties", filter: `content_id=eq.${contentId}` }, () => { fetch(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [contentId]);

  if (parties.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl glass p-5 space-y-3">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
        Live Parties
      </h4>
      {parties.map((p) => (
        <a key={p.id} href={`/party/${p.id}`} className="block rounded-xl bg-secondary/50 hover:bg-secondary transition-colors p-3">
          <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
          <p className="text-[10px] text-primary mt-0.5 flex items-center gap-1">
            <Globe className="h-3 w-3" /> Global · Live now
          </p>
        </a>
      ))}
    </div>
  );
};

export default Watch;
