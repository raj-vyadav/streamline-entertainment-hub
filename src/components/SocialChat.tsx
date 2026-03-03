import { useState, useRef, useEffect } from "react";
import { Send, Smile, Users, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const SocialChat = ({ contentId }: { contentId?: string }) => {
  const { messages, sendMessage, loading, isAuthenticated } = useRealtimeChat(contentId);
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full rounded-2xl glass overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-display font-semibold text-sm text-foreground">Live Chat</h3>
        <span className="flex items-center gap-1.5 text-xs text-primary">
          <Users className="h-3.5 w-3.5" />
          {messages.length} messages
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-4">Loading chat...</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No messages yet. Be the first!</p>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-2.5"
              >
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{msg.display_name[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {msg.user_id === user?.id ? "You" : msg.display_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{msg.message}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border">
        {isAuthenticated ? (
          <div className="flex gap-2">
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Smile className="h-4 w-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Say something..."
              className="flex-1 text-xs bg-secondary rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button
              onClick={handleSend}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link to="/auth" className="flex items-center justify-center gap-2 p-2 text-sm text-primary hover:underline">
            <LogIn className="h-4 w-4" />
            Sign in to chat
          </Link>
        )}
      </div>
    </div>
  );
};

export default SocialChat;
