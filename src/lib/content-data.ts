export interface ContentItem {
  id: string;
  title: string;
  image: string;
  genre: string;
  year: number;
  duration: string;
  rating: number;
  description: string;
  type: "movie" | "series" | "interactive";
  isAIPowered?: boolean;
  viewers?: number;
  tags: string[];
}

export const contentLibrary: ContentItem[] = [
  {
    id: "nexus-chronicles",
    title: "The Nexus Chronicles",
    image: "nexus-chronicles",
    genre: "Sci-Fi Thriller",
    year: 2025,
    duration: "1h 42m",
    rating: 9.2,
    description: "An AI-powered interactive thriller where YOUR choices shape the story. Experience dynamic storytelling that adapts to your decisions in real-time.",
    type: "interactive",
    isAIPowered: true,
    viewers: 1234,
    tags: ["Interactive", "AI-Powered", "Sci-Fi"],
  },
  {
    id: "echoes-eternity",
    title: "Echoes of Eternity",
    image: "echoes-eternity",
    genre: "Fantasy Adventure",
    year: 2025,
    duration: "2h 15m",
    rating: 8.7,
    description: "Journey through ancient mystical realms where forgotten magic awakens. An epic saga of destiny and sacrifice.",
    type: "movie",
    tags: ["Fantasy", "Adventure", "Epic"],
  },
  {
    id: "shadow-protocol",
    title: "Shadow Protocol",
    image: "shadow-protocol",
    genre: "Thriller",
    year: 2024,
    duration: "1h 58m",
    rating: 8.9,
    description: "A covert operative uncovers a conspiracy that threatens the very fabric of global security.",
    type: "movie",
    tags: ["Thriller", "Action", "Espionage"],
  },
  {
    id: "city-of-stars",
    title: "City of Stars",
    image: "city-of-stars",
    genre: "Romance",
    year: 2025,
    duration: "1h 45m",
    rating: 8.3,
    description: "Two dreamers find love amidst the dazzling lights of a city that never sleeps.",
    type: "movie",
    tags: ["Romance", "Drama", "Musical"],
  },
  {
    id: "deep-blue",
    title: "Deep Blue Horizon",
    image: "deep-blue",
    genre: "Documentary",
    year: 2024,
    duration: "1h 30m",
    rating: 9.0,
    description: "Descend into the unexplored depths of our oceans and witness life forms beyond imagination.",
    type: "series",
    tags: ["Documentary", "Nature", "Ocean"],
  },
  {
    id: "the-hollow",
    title: "The Hollow",
    image: "the-hollow",
    genre: "Horror",
    year: 2024,
    duration: "Season 1",
    rating: 8.5,
    description: "A family moves into a centuries-old mansion, only to discover the darkness that dwells within.",
    type: "series",
    tags: ["Horror", "Mystery", "Supernatural"],
  },
];

export const categories = [
  "Trending Now",
  "AI Interactive",
  "New Releases",
  "Watch Parties",
  "Top Rated",
  "Sci-Fi & Fantasy",
];
