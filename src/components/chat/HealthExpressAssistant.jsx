import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, X, Send, Sparkles, Phone, Upload, ArrowRight, 
  RotateCcw, ShieldCheck, CheckCircle2, ChevronDown, Activity, ChevronRight, User, PhoneCall
} from 'lucide-react';
import { askGeminiAssistant } from '../../services/geminiService';
import { openWhatsApp, DEFAULT_MESSAGES } from '../../utils/whatsapp';
import { useAuth } from '../../context/AuthContext';
import { HEX_SPECIFICATION } from '../../data/chatbotKnowledge';

export default function HealthExpressAssistant({ onOpenUploadModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState(0);
  const [isTooltipDismissed, setIsTooltipDismissed] = useState(false);

  // User Lead Capture (Rule 19)
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isLeadCaptured, setIsLeadCaptured] = useState(false);
  const [showLeadPrompt, setShowLeadPrompt] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const tooltipPrompts = [
    "💬 How may I assist you today?",
    "🧪 Find lab tests in Bengaluru",
    "🏡 Ask about Home Healthcare & Nursing",
    "⚡ Connect with your Health Manager"
  ];

  // Custom Event Listener for Global Open Triggers
  useEffect(() => {
    const handleCustomOpen = (event) => {
      setIsOpen(true);
      if (event.detail?.initialQuery) {
        setTimeout(() => {
          handleSendMessage(event.detail.initialQuery);
        }, 300);
      }
    };

    window.addEventListener('open-health-express-assistant', handleCustomOpen);
    return () => window.removeEventListener('open-health-express-assistant', handleCustomOpen);
  }, []);

  // Rotate speech tooltip prompts every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTooltipIndex((prev) => (prev + 1) % tooltipPrompts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Check auth or local lead state
  useEffect(() => {
    if (user?.name && user?.phone) {
      setGuestName(user.name);
      setGuestPhone(user.phone);
      setIsLeadCaptured(true);
    } else {
      const savedName = localStorage.getItem('hex_guest_name');
      const savedPhone = localStorage.getItem('hex_guest_phone');
      if (savedName && savedPhone) {
        setGuestName(savedName);
        setGuestPhone(savedPhone);
        setIsLeadCaptured(true);
      }
    }
  }, [user]);

  // Initialize Welcome Message on Open matching HEX Specs
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const activeName = guestName || (user?.name ? user.name.split(' ')[0] : '');
      const initialGreeting = {
        id: 1,
        sender: 'assistant',
        text: `Namaste${activeName ? ' ' + activeName : ''}! 👋\n\n**${HEX_SPECIFICATION.agentIdentity.greeting}**\n\nI am **HEX**, your Health Express family health manager. I can explain diagnostic services, home nursing care, pilot coverage in Bengaluru, or connect you directly with your Health Manager.`,
        quickReplies: [
          { label: "📄 Upload Prescription", action: "open_upload_modal" },
          { label: "🧪 Lab Diagnostics", action: "explore_tests" },
          { label: "🏡 Home Nursing & Care", action: "whatsapp_service_nursing" },
          { label: "📍 Bengaluru Coverage", action: "whatsapp_locality" },
          { label: "💬 Connect with Health Manager", action: "whatsapp_general" }
        ]
      };
      setMessages([initialGreeting]);

      if (!isLeadCaptured && !activeName) {
        setShowLeadPrompt(true);
      }
    }
  }, [isOpen, user, guestName, isLeadCaptured]);

  // Scroll message container to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showLeadPrompt]);

  // Save guest lead info (Rule 19)
  const handleSaveLead = (e) => {
    if (e) e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) return;

    localStorage.setItem('hex_guest_name', guestName.trim());
    localStorage.setItem('hex_guest_phone', guestPhone.trim());
    setIsLeadCaptured(true);
    setShowLeadPrompt(false);

    const leadConfirmedMsg = {
      id: Date.now(),
      sender: 'assistant',
      text: `Thank you, **${guestName.trim()}**! Your contact details are saved for your Health Manager. ${HEX_SPECIFICATION.agentIdentity.greeting}`
    };
    setMessages((prev) => [...prev, leadConfirmedMsg]);
  };

  // Process user input via Hybrid Gemini RAG Engine
  const handleSendMessage = async (textToSend = inputQuery) => {
    const query = textToSend.trim();
    if (!query) return;

    // Append User Message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const response = await askGeminiAssistant(query, messages, {
        userName: guestName || user?.name,
        userPhone: guestPhone || user?.phone
      });

      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: response.text,
        quickReplies: response.quickReplies,
        whatsappMsg: response.whatsappMsg
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error("HEX processing error:", e);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Quick Reply Actions
  const handleQuickAction = (reply) => {
    const { label, action } = reply;

    if (action === 'open_upload_modal') {
      if (onOpenUploadModal) onOpenUploadModal();
      setIsOpen(false);
      return;
    }

    if (action === 'whatsapp_prescription') {
      openWhatsApp("Namaste Health Express! I would like to send my prescription for service coordination.");
      return;
    }

    if (action === 'whatsapp_general') {
      openWhatsApp(DEFAULT_MESSAGES.general);
      return;
    }

    if (action === 'whatsapp_service_nursing') {
      openWhatsApp("Namaste Health Express! I am interested in Home Healthcare Nursing in Bengaluru. Please provide a quotation.");
      return;
    }

    if (action === 'whatsapp_locality') {
      openWhatsApp("Namaste Health Express! I would like to check service availability in my area in Bengaluru.");
      return;
    }

    if (action === 'nav_services') {
      navigate('/services');
      setIsOpen(false);
      return;
    }

    if (action.startsWith('whatsapp_test_')) {
      const testId = action.replace('whatsapp_test_', '');
      openWhatsApp(`Namaste Health Express! I am interested in ${testId.toUpperCase()}. Please assist me with details.`);
      return;
    }

    // Default: Send chip text into chat flow
    handleSendMessage(label);
  };

  return (
    <div className="fixed z-50 bottom-20 right-4 sm:bottom-6 sm:right-6 flex flex-col items-end">
      
      {/* Dynamic Floating Speech Teaser Tooltip */}
      {!isOpen && !isTooltipDismissed && (
        <div className="mb-3 animate-bounce-subtle flex items-center gap-2">
          <div 
            onClick={() => setIsOpen(true)}
            className="cursor-pointer bg-white text-slate-900 border border-purple-200/80 shadow-xl px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-purple-50 transition-all hover:scale-105"
          >
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
            <span>{tooltipPrompts[tooltipIndex]}</span>
          </div>
          <button
            onClick={() => setIsTooltipDismissed(true)}
            className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] shadow-xs"
            aria-label="Dismiss tip"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Circular Avatar Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-2xl shadow-purple-950/50 ring-4 ring-purple-400/40 animate-pulse-glow transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer shrink-0"
          aria-label="Open HEX AI Agent"
        >
          <img 
            src="/assistant_avatar.jpg" 
            alt="HEX AI Agent Avatar"
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300" 
          />
          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
        </button>
      )}

      {/* HEX Chatbot Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[84vh] sm:h-[640px] max-h-[740px] bg-white rounded-3xl shadow-2xl border border-purple-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 p-4 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white/90 shadow-md shrink-0">
                <img src="/assistant_avatar.jpg" alt="HEX Care Assistant" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-purple-900"></span>
              </div>

              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <span>HEX — AI Care Manager</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    LIVE PILOT
                  </span>
                </div>
                <div className="text-[10px] text-purple-200">
                  Health Express Informational Assistant
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-purple-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message History Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
              >
                <div className="flex items-start gap-2 max-w-[90%]">
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-purple-200 shrink-0 mt-0.5 shadow-xs">
                      <img src="/assistant_avatar.jpg" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-purple-700 text-white rounded-br-xs font-medium ml-auto'
                        : 'bg-white text-slate-800 border border-purple-100 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>

                {/* Direct WhatsApp Callout Banner */}
                {msg.whatsappMsg && (
                  <button
                    onClick={() => openWhatsApp(msg.whatsappMsg)}
                    className="max-w-[88%] p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-[11px] font-bold flex items-center justify-between gap-2 shadow-xs transition-all hover:scale-[1.01]"
                  >
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/20" />
                      <span>Connect with Health Manager</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                  </button>
                )}

                {/* Quick Action Chips */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 max-w-[95%]">
                    {msg.quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAction(reply)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-bold shadow-xs hover:border-purple-300 transition-all text-left flex items-center gap-1"
                      >
                        <span>{reply.label}</span>
                        <ChevronRight className="w-3 h-3 text-purple-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Rule 19: Guest Name & Phone Capture Prompt */}
            {showLeadPrompt && !isLeadCaptured && (
              <div className="p-3.5 bg-purple-50/90 border border-purple-200 rounded-2xl space-y-2 animate-in fade-in">
                <div className="text-[11px] font-extrabold text-purple-950 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span>Please provide your Name & Phone Number for care coordination:</span>
                </div>
                <form onSubmit={handleSaveLead} className="space-y-2">
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400"
                  />
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="10-digit Phone Number"
                    className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Start Chat as {guestName || 'Guest'}
                  </button>
                </form>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium italic pt-1 pl-8">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span>HEX is retrieving approved information...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 bg-white border-t border-purple-100 shrink-0 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about tests, home nursing, Bengaluru coverage..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="p-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white font-bold transition-colors shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-0.5">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                <span>HEX • Version 1.0 Informational Assistant</span>
              </span>
              <button
                onClick={() => setMessages([])}
                className="hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Chat</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
