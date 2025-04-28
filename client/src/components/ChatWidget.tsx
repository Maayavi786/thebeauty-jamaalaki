import React, { useState, useRef, useEffect } from "react";
import "./ChatWidget.css";
import { fetchGroqResponse } from "./groq";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, X } from "lucide-react";

interface Message {
  role: "user" | "ai" | "system";
  content: string;
}

// Welcome message that appears when chat is first opened
const WELCOME_MESSAGE: Message = {
  role: "ai",
  content: "Hello! I'm your beauty assistant. How can I help you with salon services, beauty tips, or bookings today?"
};

// Arabic welcome message
const WELCOME_MESSAGE_AR: Message = {
  role: "ai",
  content: "مرحبا! أنا مساعدك الجمالي. كيف يمكنني مساعدتك بخدمات الصالون، نصائح الجمال، أو الحجوزات اليوم؟"
};

const ChatWidget: React.FC = () => {
  const { language, dir, isRtl } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Show welcome message when chat is first opened
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([isRtl ? WELCOME_MESSAGE_AR : WELCOME_MESSAGE]);
    }
  }, [open, messages.length, isRtl]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);
  
  // Focus input field when chat is opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);
  
  // Load messages from localStorage on component mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
  }, []);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('chatMessages', JSON.stringify(messages.slice(-20))); // Keep last 20 messages
      } catch (e) {
        console.error('Failed to save chat history:', e);
      }
    }
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
    // Re-add welcome message
    setMessages([isRtl ? WELCOME_MESSAGE_AR : WELCOME_MESSAGE]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setError(null);
    
    const userMsg: Message = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    
    try {
      // Compose chat history for Groq (last 10 messages)
      const chatHistory = [...messages, userMsg].slice(-10).map(m => ({
        role: m.role === "user" ? "user" : m.role === "system" ? "system" : "assistant",
        content: m.content,
      }));
      
      const aiReply = await fetchGroqResponse(chatHistory);
      
      // Check if error message
      if (aiReply.startsWith('[') && aiReply.endsWith(']')) {
        setError(aiReply);
        setMessages((msgs) => [...msgs, { 
          role: "ai", 
          content: isRtl ? 
            "عذراً، أواجه مشكلة في الاتصال. يرجى المحاولة مرة أخرى لاحقاً." : 
            "Sorry, I'm having connection issues. Please try again later."
        }]);
      } else {
        setMessages((msgs) => [...msgs, { role: "ai", content: aiReply }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to get AI response');
      setMessages((msgs) => [...msgs, { 
        role: "ai", 
        content: isRtl ? 
          "عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى." : 
          "Sorry, something went wrong. Please try again."
      }]);
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
          className="fixed bottom-6 right-6 rounded-full shadow-lg w-14 h-14 p-0 z-50 hover:scale-105 transition-transform"
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
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={clearChat}
                title={language === 'ar' ? 'مسح المحادثة' : 'Clear chat'}
                aria-label={language === 'ar' ? 'مسح المحادثة' : 'Clear chat'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X size={18} />
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          <div className="chat-widget-messages flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-muted" dir={dir}>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {language === 'ar' ? 'ابدأ محادثة جديدة!' : 'Start a new conversation!'}
              </div>
            ) : (
              messages.map((msg, idx) => (
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
              ))
            )}
            {loading && (
              <div className={`rounded-lg px-3 py-2 max-w-[80%] bg-accent text-accent-foreground mr-auto ${dir === 'rtl' ? 'font-arabic text-right' : ''}`}>
                <span className="block text-xs mb-1 opacity-70">
                  {language === 'ar' ? 'الذكاء الاصطناعي' : 'AI'}
                </span>
                <div className="flex items-center gap-1">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse delay-150">●</span>
                  <span className="animate-pulse delay-300">●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-widget-input-row flex gap-2 p-3 border-t border-border bg-background">
            <Input
              ref={inputRef}
              type="text"
              placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
              value={input}
              dir={dir}
              className={`flex-1 ${dir === 'rtl' ? 'font-arabic text-right' : ''}`}
              style={dir === 'rtl' ? {fontFamily: 'Tajawal, Arial, sans-serif'} : {}}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              variant="primary"
              size="sm"
              className="flex-shrink-0 w-10 h-10 p-0 rounded-full"
            >
              {loading ? 
                <Loader2 className="h-4 w-4 animate-spin" /> : 
                <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
