import { Link } from "react-router-dom";
import { Play, Star, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import type { ContentItem } from "@/lib/content-data";

import nexusImg from "@/assets/nexus-chronicles.jpg";
import echoesImg from "@/assets/echoes-eternity.jpg";
import shadowImg from "@/assets/shadow-protocol.jpg";
import cityImg from "@/assets/city-of-stars.jpg";
import deepImg from "@/assets/deep-blue.jpg";
import hollowImg from "@/assets/the-hollow.jpg";

const imageMap: Record<string, string> = {
  "nexus-chronicles": nexusImg,
  "echoes-eternity": echoesImg,
  "shadow-protocol": shadowImg,
  "city-of-stars": cityImg,
  "deep-blue": deepImg,
  "the-hollow": hollowImg,
};

interface ContentCardProps {
  item: ContentItem;
  index?: number;
}

const ContentCard = ({ item, index = 0 }: ContentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative flex-shrink-0 w-[200px] md:w-[240px]"
    >
      <Link to={`/watch/${item.id}`}>
        <div className="content-card-hover relative aspect-[2/3] rounded-xl overflow-hidden">
          <img
            src={imageMap[item.image]}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {item.isAIPowered && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground">
                <Sparkles className="h-3 w-3" /> AI
              </span>
            )}
            {item.viewers && (
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full glass text-foreground">
                <Users className="h-3 w-3" /> {item.viewers.toLocaleString()}
              </span>
            )}
          </div>

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
              <Play className="h-5 w-5 text-primary-foreground ml-0.5" fill="currentColor" />
            </div>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 text-primary" fill="currentColor" />
                {item.rating}
              </span>
              <span>•</span>
              <span>{item.duration}</span>
            </div>
          </div>
        </div>

        <div className="mt-2 px-1">
          <h3 className="text-sm font-semibold text-foreground truncate">{item.title}</h3>
          <p className="text-xs text-muted-foreground">{item.genre}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ContentCard;
