import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ContentRow from "@/components/ContentRow";
import { contentLibrary } from "@/lib/content-data";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      <div className="py-12 space-y-12">
        <ContentRow title="Trending Now" items={contentLibrary} />
        <ContentRow
          title="AI Interactive"
          items={contentLibrary.filter((c) => c.isAIPowered || c.type === "interactive")}
        />
      </div>

      <FeaturesSection />

      {/* CTA */}
      <section className="py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 md:px-8"
        >
          <div className="relative rounded-3xl glass glow-border p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
                Ready to <span className="gradient-text">Stream Different</span>?
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Join the movement. Experience entertainment the way it was always meant to be.
              </p>
              <Link to="/browse">
                <Button variant="hero" size="lg">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-sm font-bold gradient-text">StreamSphere</span>
          <p className="text-xs text-muted-foreground">© 2025 StreamSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
