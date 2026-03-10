import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SocialChat from "@/components/SocialChat";
import ContentRow from "@/components/ContentRow";
import { contentLibrary } from "@/lib/content-data";
import { supabase } from "@/integrations/supabase/client";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Play, Star, Clock, Calendar, Sparkles, Users, ThumbsUp, Share2, Plus, Check, Monitor, Smartphone, Tv } from "lucide-react";
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

  // Fetch the DB content UUID and video_url by slug
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
          <img
            src={featuredBanner}
            alt={content.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="h-20 w-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg"
              style={{ boxShadow: "var(--shadow-glow-strong)" }}
            >
              <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
            </motion.button>
          </div>

          {content.viewers && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full glass">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-xs font-medium text-foreground">
                {content.viewers.toLocaleString()} watching
              </span>
            </div>
          )}

          {content.isAIPowered && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              <span className="text-xs font-semibold text-primary-foreground">AI-Powered Story</span>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3">
                {content.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-primary" fill="currentColor" />
                  {content.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {content.year}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {content.duration}
                </span>
                {content.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full bg-secondary text-xs text-secondary-foreground">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">{content.description}</p>

              <div className="flex flex-wrap gap-3">
                <Button variant="hero">
                  <Play className="h-4 w-4 mr-2" fill="currentColor" />
                  Resume Watching
                </Button>
                <Button variant="ghost-glow" size="icon"><ThumbsUp className="h-4 w-4" /></Button>
                <Button
                  variant="ghost-glow"
                  size="icon"
                  onClick={toggleWatchlist}
                  disabled={watchlistLoading}
                  className={isInWatchlist ? "text-primary" : ""}
                >
                  {isInWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
                <Button variant="ghost-glow" size="icon"><Share2 className="h-4 w-4" /></Button>
              </div>
            </motion.div>

            {/* Cross-Device */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl glass p-6"
            >
              <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Cross-Device Fluidity
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Continue watching seamlessly on any device. Your progress is always synced.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: Smartphone, label: "Phone" },
                  { icon: Monitor, label: "Desktop" },
                  { icon: Tv, label: "Smart TV" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar: Social Chat */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Watch Party</h3>
              </div>
              <SocialChat contentId={dbContentId} />
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

export default Watch;
