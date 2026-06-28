import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import AppShell from "./AppShell";
import { useAuth } from "../../hooks/useAuth";
import { aiGuideService, ChatMessage } from "../../services/aiGuideService";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

const GUIDE_TITLES: Record<string, string> = {
  "vedic-guide": "Vedic Guide",
  "kundali-guide": "Kundali Guide",
  "numerology-guide": "Numerology Guide",
  "remedy-guide": "Remedy Guide",
  "relationship-guide": "Relationship Guide",
  "career-guide": "Career Guide"
};

const AppAstroChat = () => {
  const { guideId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const guideTitle = guideId ? GUIDE_TITLES[guideId] || "Spiritual Guide" : "Spiritual Guide";

  useEffect(() => {
    if (!user || !guideId) return;

    const unsubscribe = aiGuideService.subscribeToMessages(user.uid, guideId, (msgs) => {
      setMessages(msgs);
      setIsTyping(false); // Stop typing indicator when new message arrives
    });

    return () => unsubscribe();
  }, [user, guideId]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !user || !guideId) return;
    
    const content = input.trim();
    setInput("");
    setIsTyping(true);

    try {
      await aiGuideService.sendMessage(user.uid, guideId, content);
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsTyping(false);
    }
  };

  return (
    <AppShell title={guideTitle} eyebrow="Live AI Session" showBack hideBottomNav>
      <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 dark:text-slate-400 mt-10">
              <p>Start a conversation with your {guideTitle}.</p>
              <p className="text-xs mt-2">Ask about your day, energies, or seek spiritual reflection.</p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div key={msg.id || idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    isUser 
                      ? "bg-amber-600 text-white rounded-br-none" 
                      : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  {msg.createdAt && (
                    <p className={`text-[10px] mt-1 text-right ${isUser ? "text-amber-200" : "text-slate-400"}`}>
                      {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), "hh:mm a") : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 shadow-sm">
                <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                <span className="text-xs text-slate-500">Meditating on a response...</span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Seek guidance..."
              className="flex-1 bg-slate-100 dark:bg-slate-900 border-none rounded-full px-4 py-3 text-sm focus:ring-1 focus:ring-amber-500 outline-none text-slate-800 dark:text-white"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-3 rounded-full bg-amber-500 text-white disabled:opacity-50 disabled:bg-slate-300"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        
      </div>
    </AppShell>
  );
};

export default AppAstroChat;
