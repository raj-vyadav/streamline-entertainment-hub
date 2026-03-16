import { useState, useEffect } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ContentRatingProps {
  contentId?: string;
}

interface UserRating {
  id: string;
  rating: number;
  review: string | null;
}

interface PublicRating {
  id: string;
  rating: number;
  review: string | null;
  created_at: string;
  user_id: string;
}

const ContentRating = ({ contentId }: ContentRatingProps) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<UserRating | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allRatings, setAllRatings] = useState<PublicRating[]>([]);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    if (!contentId) return;
    const fetchRatings = async () => {
      // Fetch all ratings for this content
      const { data: ratings } = await supabase
        .from("user_ratings")
        .select("id, rating, review, created_at, user_id")
        .eq("content_id", contentId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (ratings && ratings.length > 0) {
        setAllRatings(ratings);
        const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
        setAvgRating(Math.round(avg * 10) / 10);
      }

      // Fetch user's own rating
      if (user) {
        const { data } = await supabase
          .from("user_ratings")
          .select("id, rating, review")
          .eq("content_id", contentId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          setUserRating(data);
          setSelectedRating(data.rating);
          setReview(data.review || "");
        }
      }
      setLoading(false);
    };
    fetchRatings();
  }, [contentId, user]);

  const handleSubmit = async () => {
    if (!user || !contentId || selectedRating === 0) return;
    setSaving(true);

    if (userRating) {
      const { error } = await supabase
        .from("user_ratings")
        .update({ rating: selectedRating, review: review.trim() || null })
        .eq("id", userRating.id);
      if (error) toast.error("Failed to update rating");
      else {
        toast.success("Rating updated!");
        setUserRating({ ...userRating, rating: selectedRating, review: review.trim() || null });
      }
    } else {
      const { data, error } = await supabase
        .from("user_ratings")
        .insert({ user_id: user.id, content_id: contentId, rating: selectedRating, review: review.trim() || null })
        .select("id, rating, review")
        .single();
      if (error) toast.error("Failed to submit rating");
      else {
        toast.success("Rating submitted!");
        setUserRating(data);
      }
    }
    setSaving(false);
  };

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl glass p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" fill="currentColor" />
          Ratings & Reviews
        </h3>
        {allRatings.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">{avgRating}</span>
            <div className="text-xs text-muted-foreground">
              <div>{allRatings.length} review{allRatings.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
        )}
      </div>

      {/* Star picker */}
      {user ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {userRating ? "Update your rating:" : "Rate this content:"}
          </p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
              <button
                key={val}
                onMouseEnter={() => setHoverRating(val)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setSelectedRating(val)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-5 w-5 transition-colors ${
                    val <= (hoverRating || selectedRating)
                      ? "text-primary"
                      : "text-muted-foreground/30"
                  }`}
                  fill={val <= (hoverRating || selectedRating) ? "currentColor" : "none"}
                />
              </button>
            ))}
            {selectedRating > 0 && (
              <span className="ml-2 text-sm text-primary font-semibold">{selectedRating}/10</span>
            )}
          </div>

          <Textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write a short review (optional)..."
            rows={2}
            className="bg-secondary/50 border-border text-sm"
          />

          <Button
            onClick={handleSubmit}
            disabled={saving || selectedRating === 0}
            size="sm"
            className="gap-2"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {userRating ? "Update" : "Submit"}
          </Button>
        </div>
      ) : (
        <Link to="/auth" className="text-sm text-primary hover:underline">
          Sign in to rate this content
        </Link>
      )}

      {/* Recent reviews */}
      {allRatings.filter((r) => r.review).length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Recent Reviews</p>
          {allRatings
            .filter((r) => r.review)
            .slice(0, 5)
            .map((r) => (
              <div key={r.id} className="flex gap-2">
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-3.5 w-3.5 text-primary" fill="currentColor" />
                  <span className="text-xs font-semibold text-primary">{r.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.review}</p>
              </div>
            ))}
        </div>
      )}
    </motion.div>
  );
};

export default ContentRating;
