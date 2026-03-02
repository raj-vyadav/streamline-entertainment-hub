import Navbar from "@/components/Navbar";
import ContentRow from "@/components/ContentRow";
import ContentCard from "@/components/ContentCard";
import { contentLibrary, categories } from "@/lib/content-data";
import { motion } from "framer-motion";
import { useState } from "react";
import { Play, Star, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import featuredBanner from "@/assets/featured-banner.jpg";

const Browse = () => {
  const [activeCategory, setActiveCategory] = useState("Trending Now");
  const featured = contentLibrary[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Featured Banner */}
      <section className="relative h-[60vh] overflow-hidden">
        <img src={featuredBanner} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">AI-Powered Interactive</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
              {featured.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-primary" fill="currentColor" />
                {featured.rating}
              </span>
              <span>{featured.year}</span>
              <span>{featured.duration}</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                {featured.type}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{featured.description}</p>
            <div className="flex gap-3">
              <Link to={`/watch/${featured.id}`}>
                <Button variant="hero" size="lg">
                  <Play className="h-5 w-5 mr-2" fill="currentColor" />
                  Play Now
                </Button>
              </Link>
              <Button variant="ghost-glow">More Info</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="sticky top-[60px] z-30 glass-strong py-3">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="py-8 space-y-10">
        <ContentRow title={activeCategory} items={contentLibrary} />
        <ContentRow title="New Releases" items={[...contentLibrary].reverse()} />
        <ContentRow title="Top Rated" items={contentLibrary.sort((a, b) => b.rating - a.rating)} />

        {/* Grid Section */}
        <section className="container mx-auto px-4 md:px-8">
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground mb-4">All Content</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {contentLibrary.map((item, i) => (
              <ContentCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Browse;
