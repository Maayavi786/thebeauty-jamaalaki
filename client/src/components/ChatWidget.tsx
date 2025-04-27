import React, { useState, useRef, useEffect } from "react";
import "./ChatWidget.css";
import { fetchGroqResponse } from "./groq";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "ai";
  content: string;
}

// No need for isArabic; use global dir/language

const mockAIResponse = async (input: string): Promise<string> => {
  // Simulate an AI response (replace with real API call as needed)
  await new Promise((res) => setTimeout(res, 700));
  return `AI: You said "${input}"`;
};

const ChatWidget: React.FC = () => {
  const { language, dir } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      // Compose chat history for GPT (last 10 messages, mapped to OpenAI format)
      const chatHistory = [...messages, userMsg].slice(-10).map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));
      const aiReply = await fetchGroqResponse(chatHistory);
      setMessages((msgs) => [...msgs, { role: "ai", content: aiReply }]);
    } catch (err) {
      setMessages((msgs) => [...msgs, { role: "ai", content: "[Error getting response from AI]" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget-container">
      {!open && (
        <Button
          variant="accent"
          size="lg"
          className="fixed bottom-6 right-6 rounded-full shadow-lg text-2xl w-14 h-14 p-0 z-50"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          💬
        </Button>
      )}
      {open && (
        <div className="chat-widget bg-background border border-border rounded-xl shadow-2xl w-[340px] max-h-[520px] flex flex-col fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-6">
          <div className="chat-widget-header flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground rounded-t-xl">
            <span className="font-semibold">{language === 'ar' ? 'الدردشة الذكية' : 'AI Chat'}</span>
            <Button
              variant="ghost"
              size="icon"
              className="text-xl"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ×
            </Button>
          </div>
          <div className="chat-widget-messages flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-muted" dir={dir}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-lg px-3 py-2 max-w-[80%] text-sm break-words ${msg.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-accent text-accent-foreground mr-auto'} ${dir === 'rtl' ? 'font-arabic text-right' : ''}`}
                dir={dir}
                style={dir === 'rtl' ? {fontFamily: 'Tajawal, Arial, sans-serif'} : {}}
              >
                {msg.role === 'ai' && (
                  <span className="block text-xs mb-1 opacity-70">
                    {language === 'ar' ? 'الذكاء الاصطناعي' : 'AI'}
                  </span>
                )}
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="chat-widget-message chat-widget-message-ai" style={{opacity:0.7}}>
                ...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-widget-input-row flex gap-2 p-3 border-t border-border bg-background">
            <Input
              type="text"
              placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
              value={input}
              dir={dir}
              className={dir === 'rtl' ? 'font-arabic text-right' : ''}
              style={dir === 'rtl' ? {fontFamily: 'Tajawal, Arial, sans-serif'} : {}}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              variant="primary"
              size="md"
              className="min-w-[72px]"
            >
              {loading ? <span className="animate-pulse">...</span> : language === 'ar' ? 'إرسال' : 'Send'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
