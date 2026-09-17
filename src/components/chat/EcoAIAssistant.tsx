'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Leaf, 
  MessageSquare, 
  HelpCircle,
  CornerDownLeft,
  ChevronRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

const QUICK_PROMPTS = [
  'Gimana cara daur ulang botol skincare & tube pasta gigi?',
  'Kenapa jeans rework hemat ribuan liter air?',
  'Tips zero-waste anak kos dengan budget hemat?',
];

export default function EcoAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const nextIdRef = useRef(10);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Halo! Aku EcoGenie AI 🍃 Tanya apa saja seputar daur ulang kosan, upcycle fashion, jejak karbon, atau cara hidup zero-waste di kampus!',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputMessage;
    if (!message.trim() || isLoading) return;

    nextIdRef.current += 1;
    const userMsgId = `msg-${nextIdRef.current}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: message,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/ask-eco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: message }),
      });

      const data = await response.json();
      if (data.answer) {
        nextIdRef.current += 1;
        const botMsgId = `msg-${nextIdRef.current}`;
        setMessages((prev) => [
          ...prev,
          {
            id: botMsgId,
            sender: 'bot',
            text: data.answer,
          },
        ]);
      } else {
        throw new Error('No answer');
      }
    } catch {
      nextIdRef.current += 1;
      const errorMsgId = `msg-${nextIdRef.current}`;
      setMessages((prev) => [
        ...prev,
        {
          id: errorMsgId,
          sender: 'bot',
          text: 'Oops, koneksi EcoGenie terputus sebentar. Pastikan botol plastikmu dicuci bersih sebelum didaur ulang ya! Coba tanya lagi sebentar lagi.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button & Micro Speech Tooltip */}
      <div 
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end gpu-layer"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Speech Tooltip */}
        {showTooltip && !isOpen && (
          <div 
            onClick={() => setShowTooltip(false)}
            className="mb-2 mr-1 px-3 py-1.5 rounded-2xl bg-[#FAF8F5] text-[#1A4D3A] text-xs font-bold shadow-clay-card border border-white flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300 cursor-pointer"
          >
            <span>💬 Punya botol bekas? Yuk scan!</span>
            <span className="text-[10px] text-[#1A4D3A]/40 hover:text-[#1A4D3A]">✕</span>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen((prev) => !prev);
            setShowTooltip(false);
          }}
          className="group relative flex items-center gap-2.5 px-4 sm:px-5 py-3.5 rounded-full bg-gradient-earth text-white font-extrabold text-xs sm:text-sm shadow-clay-green hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/80"
        >
          {/* Subtle Animated Pulse Ring - Disabled on mobile */}
          <span className="hidden md:inline absolute -inset-1 rounded-full bg-[#6DB677]/30 animate-ping pointer-events-none -z-10" />

          <div className="relative">
            <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF9E20] rounded-full border border-white md:animate-pulse" />
          </div>
          <span className="hidden sm:inline">Tanya EcoGenie AI</span>
          <span className="sm:hidden">Eco AI</span>
        </button>
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] max-w-sm sm:max-w-md bg-[#FAF8F5] rounded-[32px] shadow-2xl border border-white flex flex-col h-[520px] overflow-hidden animate-in slide-in-from-bottom-5 duration-300 gpu-layer"
          style={{ transform: 'translateZ(0)' }}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-earth text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold flex items-center gap-1">
                  <span>EcoGenie Assistant</span>
                  <span className="bg-[#6DB677] text-[9px] px-1.5 py-0.2 rounded font-bold">
                    AI
                  </span>
                </h4>
                <p className="text-[10px] text-white/80">
                  Konsultan Eco & Upcycle Gen-Z
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-[#EBF4EE] text-[#357A59] flex items-center justify-center text-xs flex-shrink-0 mt-1 shadow-sm">
                    🌱
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-earth text-white rounded-br-none shadow-clay-green'
                      : 'bg-[#FAF8F5] text-[#1A4D3A] rounded-bl-none shadow-clay-card border border-white whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-xs text-[#1A4D3A]/60 p-2">
                <div className="w-5 h-5 rounded-full bg-[#E8F2ED] text-[#357A59] flex items-center justify-center animate-spin">
                  ⏳
                </div>
                <span>EcoGenie sedang berpikir...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-[#FAF8F5] border-t border-[#1A4D3A]/5 overflow-x-auto no-scrollbar flex gap-1.5">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-full bg-white text-[10px] font-bold text-[#1A4D3A]/80 shadow-clay-sm border border-white hover:text-[#357A59] whitespace-nowrap cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#FAF8F5] border-t border-white flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tanya seputar daur ulang & upcycle..."
              className="flex-1 px-3.5 py-2.5 rounded-full bg-[#FAF8F5] shadow-clay-inset border border-white text-xs text-[#1A4D3A] placeholder-[#1A4D3A]/40 focus:outline-none focus:ring-1 focus:ring-[#357A59]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="w-9 h-9 rounded-full bg-gradient-earth text-white shadow-clay-green flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
