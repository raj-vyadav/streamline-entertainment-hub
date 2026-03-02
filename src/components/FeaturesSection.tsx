import { motion } from "framer-motion";
import { Brain, Users, Monitor, Shield, Sparkles, Gamepad2 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Dynamic Storytelling",
    description: "Content evolves based on your choices. Branching plots with multiple user-driven paths.",
  },
  {
    icon: Users,
    title: "Social Circles",
    description: "Watch parties, live chat, and micro-communities for every fandom.",
  },
  {
    icon: Monitor,
    title: "Cross-Device Fluidity",
    description: "Seamlessly switch between devices. Your session picks up exactly where you left off.",
  },
  {
    icon: Sparkles,
    title: "Mood-Based Tailoring",
    description: "AI adjusts tone, pacing, and visuals to match your current mood.",
  },
  {
    icon: Gamepad2,
    title: "Interactive Experiences",
    description: "Mini-games, polls, and quizzes integrated into your viewing experience.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Blockchain-secured data with full transparency and user control.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Innovation</span> Meets Entertainment
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Groundbreaking features that transform how you experience content.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group p-6 rounded-2xl glass hover:glow-border transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
