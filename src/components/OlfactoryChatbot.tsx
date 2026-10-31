import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  MapPin,
  Compass,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  Bot,
  User,
  Calendar,
  Layers,
  Flame
} from 'lucide-react';
import { PillButton } from './PillButton';
import { Product } from '../data/siteData';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  mapsUsed?: boolean;
  mapSources?: Array<{ title: string; uri: string }>;
}

interface OlfactoryChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStoreLocator?: () => void;
  onOpenConsultation?: () => void;
  onQuickView?: (product: Product) => void;
}

export const OlfactoryChatbot: React.FC<OlfactoryChatbotProps> = ({
  isOpen,
  onClose,
  onOpenStoreLocator,
  onOpenConsultation,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Welcome to the Avelore Atelier. I am The Nose of Avelore — Master Perfumer and your Olfactory Concierge. Whether discovering raw botanicals, composing bespoke scent layering, or seeking our ateliers in Paris, London, New York, or Tokyo — how may I guide your senses?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-4-argon' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [enableMaps, setEnableMaps] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Request user location for enhanced Maps Grounding if enabled
  const handleToggleMaps = () => {
    const nextState = !enableMaps;
    setEnableMaps(nextState);
    if (nextState && !userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Geolocation optional; gracefully proceed with general boutique locator
        }
      );
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history for multi-turn
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .concat(userMsg)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          model: selectedModel,
          useMaps: enableMaps,
          userLocation,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const modelMsg: ChatMessage = {
        id: 'model_' + Date.now(),
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
        mapsUsed: data.mapsUsed,
        mapSources: data.mapSources || [],
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'model',
        text: 'The salon archives are experiencing a momentary quietude. Allow me a moment, or feel free to re-inquire.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'The archives have been refreshed. I am at your service to compose formulas, recommend perfumes, or locate our salons.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      },
    ]);
  };

  const suggestionPrompts = [
    { label: '📍 Paris Flagship (Google Maps)', query: 'Where is the Avelore Paris flagship atelier located and what are its hours?' },
    { label: '✨ Smoky Iris Formulation', query: 'Describe the note pyramid of Cuir Nocturne and how it contrasts with L\'Heure Ambrée.' },
    { label: '🌿 Scent Layering Guide', query: 'How would you layer Bourbon Vetiver with Damask Rose for an evening gathering?' },
    { label: '🏛️ Tokyo Ginza Sanctuary', query: 'Tell me about the Avelore Ginza sanctuary in Tokyo and directions to visit.' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 md:p-6 bg-[#3B0000]/60 backdrop-blur-sm transition-all animate-fadeIn">
      <div className="w-full sm:max-w-xl h-full sm:h-[88vh] bg-[#FAF2E1] border-l sm:border border-[#3B0000]/20 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#3B0000] text-[#FFD482] flex items-center justify-between border-b border-[#FFD482]/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFD482]/15 border border-[#FFD482]/40 flex items-center justify-center text-[#FFD482]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base md:text-lg tracking-wider text-[#FFD482]">
                  The Nose of Avelore
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#FFD482]/20 text-[#FFD482] tracking-widest border border-[#FFD482]/30">
                  Concierge
                </span>
              </div>
              <p className="text-xs text-[#FFD482]/75 font-sans">
                Master Perfumer · Google Maps Grounded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetChat}
              title="Reset conversation"
              className="p-2 rounded-full text-[#FFD482]/70 hover:text-[#FFD482] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close concierge"
              className="p-2 rounded-full text-[#FFD482]/70 hover:text-[#FFD482] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Model & Feature Controls Ribbon */}
        <div className="px-6 py-2.5 bg-[#FAF2E1] border-b border-[#3B0000]/10 flex flex-wrap items-center justify-between gap-2 text-xs font-sans text-[#3B0000]/80">
          {/* Model Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#3B0000]/60">
              Intelligence:
            </span>
            <div className="inline-flex rounded-full bg-[#3B0000]/5 p-0.5 border border-[#3B0000]/10">
              <button
                onClick={() => setSelectedModel('gemini-3.8-flash')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-[#3B0000] text-[#FFD482] font-bold shadow-xs'
                    : 'text-[#3B0000]/70 hover:text-[#3B0000]'
                }`}
                title="gemini-3.8-flash: General chat & Maps grounding"
              >
                Flash 3.8
              </button>
              <button
                onClick={() => setSelectedModel('gemini-4-argon')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                  selectedModel === 'gemini-4-argon'
                    ? 'bg-[#3B0000] text-[#FFD482] font-bold shadow-xs'
                    : 'text-[#3B0000]/70 hover:text-[#3B0000]'
                }`}
                title="gemini-4-argon: Complex formulation and bespoke olfactive analysis"
              >
                Argon 4
              </button>
              <button
                onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-[#3B0000] text-[#FFD482] font-bold shadow-xs'
                    : 'text-[#3B0000]/70 hover:text-[#3B0000]'
                }`}
                title="gemini-3.1-flash-lite: Swift responses"
              >
                Lite
              </button>
            </div>
          </div>

          {/* Maps Grounding Toggle */}
          <button
            onClick={handleToggleMaps}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
              enableMaps
                ? 'bg-[#3B0000] text-[#FFD482] border-[#3B0000]'
                : 'bg-white/60 text-[#3B0000]/70 border-[#3B0000]/20 hover:border-[#3B0000]/40'
            }`}
            title="Toggle live Google Maps grounding for authentic boutique coordinates"
          >
            <MapPin className={`w-3.5 h-3.5 ${enableMaps ? 'text-[#FFD482]' : 'text-[#3B0000]'}`} />
            <span>Maps Grounding</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                enableMaps ? 'bg-[#FFD482] animate-ping' : 'bg-neutral-300'
              }`}
            />
          </button>
        </div>

        {/* Scrollable Conversation Thread */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 font-sans">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`flex items-start gap-2.5 max-w-[85%] ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                    msg.role === 'user'
                      ? 'bg-[#3B0000] text-[#FFD482]'
                      : 'bg-[#FFD482] text-[#3B0000] border border-[#3B0000]/20'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl shadow-xs text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#3B0000] text-[#FFD482] rounded-tr-xs'
                      : 'bg-white text-[#3B0000] border border-[#3B0000]/10 rounded-tl-xs'
                  }`}
                >
                  {/* Text content with clean spacing */}
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Google Maps Grounding Links (if returned) */}
                  {msg.mapSources && msg.mapSources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#3B0000]/10 flex flex-col gap-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#3B0000]/60 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#3B0000]" />
                        <span>Google Maps Verified Coordinates:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.mapSources.map((source, sIdx) => (
                          <a
                            key={sIdx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#FAF2E1] hover:bg-[#FFD482]/40 text-[#3B0000] text-xs rounded-full border border-[#3B0000]/20 font-medium transition-colors"
                          >
                            <span>{source.title}</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata Tag */}
                  <div className="mt-2 flex items-center justify-between gap-3 text-[10px] opacity-60">
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <span className="font-mono">model: {msg.modelUsed}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2.5 max-w-[80%]">
              <div className="w-7 h-7 rounded-full bg-[#FFD482] text-[#3B0000] border border-[#3B0000]/20 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#3B0000]/10 text-xs text-[#3B0000]/70 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#3B0000] animate-bounce" />
                <span className="inline-block w-2 h-2 rounded-full bg-[#3B0000] animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block w-2 h-2 rounded-full bg-[#3B0000] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 italic font-display text-[#3B0000]">
                  The Master Perfumer is composing an answer...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-6 py-2 bg-[#FAF2E1] border-t border-[#3B0000]/10 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2">
          {suggestionPrompts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s.query)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-[#FFD482]/40 text-[#3B0000] border border-[#3B0000]/15 transition-colors shrink-0 cursor-pointer"
            >
              {s.label}
            </button>
          ))}
          {onOpenConsultation && (
            <button
              onClick={onOpenConsultation}
              className="text-xs px-3 py-1.5 rounded-full bg-[#3B0000] text-[#FFD482] font-semibold border border-[#3B0000] transition-colors shrink-0 cursor-pointer flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              <span>Book Private Consultation</span>
            </button>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#3B0000]/10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inquire about fragrance notes, pairings, or atelier locations..."
              disabled={loading}
              className="flex-1 bg-[#FAF2E1]/60 border border-[#3B0000]/20 rounded-full px-4 py-2.5 text-sm text-[#3B0000] placeholder-[#3B0000]/40 focus:outline-hidden focus:ring-2 focus:ring-[#3B0000]/30 focus:border-[#3B0000]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`p-3 rounded-full transition-all cursor-pointer ${
                input.trim() && !loading
                  ? 'bg-[#3B0000] text-[#FFD482] hover:bg-[#520909]'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 text-center text-[10px] text-[#3B0000]/50 tracking-wider">
            Quiet luxury olfactory intelligence powered by Gemini & Google Maps.
          </div>
        </div>
      </div>
    </div>
  );
};
