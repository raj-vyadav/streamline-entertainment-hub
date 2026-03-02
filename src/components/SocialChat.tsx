import { useState } from "react";
import { Send, Smile, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: number;
  user: string;
  avatar: string;
  message: string;
  time: string;
}

const mockMessages: ChatMessage[] = [
  { id: 1, user: "Sarah_K", avatar: "S", message: "This plot twist is incredible! 🤯", time: "2m ago" },
  { id: 2, user: "Mike_Chen", avatar: "M", message: "I chose the left corridor, what about you?", time: "1m ago" },
  { id: 3, user: "Alex_R", avatar: "A", message: "The AI adaptation is so seamless!", time: "45s ago" },
  { id: 4, user: "Emma_J", avatar: "E", message: "Watch party going strong! 🎉", time: "20s ago" },
];

const SocialChat = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: "You",
        avatar: "Y",
        message: input,
        time: "now",
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full rounded-2xl glass overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-display font-semibold text-sm text-foreground">Live Chat</h3>
        <span className="flex items-center gap-1.5 text-xs text-primary">
          <Users className="h-3.5 w-3.5" />
          1,234 watching
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2.5"
            >
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">{msg.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-foreground">{msg.user}</span>
                  <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{msg.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-3 border-t border-border">
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
      </div>
    </div>
  );
};

export default SocialChat;
