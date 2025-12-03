
import React, { useState, useEffect, useRef } from 'react';
import { ApiConfig } from '../types';
import { ChevronDown, Bot, Sparkles, BrainCircuit, Zap, ScanSearch, Wind, X, Network, Palette, Video, Film, Aperture } from 'lucide-react';

interface ApiSelectorProps {
  providers: ApiConfig[];
  selectedProvider: string;
  onSelect: (provider: string) => void;
  className?: string;
  labelFormatter?: (provider: string) => string;
}

export const ApiSelector: React.FC<ApiSelectorProps> = ({ 
  providers, 
  selectedProvider, 
  onSelect, 
  className = '',
  labelFormatter
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = providers.find(p => p.provider === selectedProvider);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getProviderIcon = (provider: string, size: number = 18) => {
    switch (provider) {
      case 'openai': return <Bot size={size} className="text-green-400" />;
      case 'gemini': return <Sparkles size={size} className="text-blue-400" />;
      case 'anthropic': return <BrainCircuit size={size} className="text-purple-400" />;
      case 'deepseek': return <ScanSearch size={size} className="text-blue-400" />;
      case 'mistral': return <Wind size={size} className="text-amber-400" />;
      case 'xai': return <X size={size} className="text-slate-100" />;
      case 'cohere': return <Network size={size} className="text-teal-400" />;
      case 'stability': return <Palette size={size} className="text-indigo-400" />;
      case 'veo': return <Video size={size} className="text-pink-400" />;
      case 'runway': return <Film size={size} className="text-rose-400" />;
      case 'luma': return <Aperture size={size} className="text-cyan-400" />;
      default: return <Zap size={size} className="text-slate-400" />;
    }
  };

  const getProviderLabel = (provider: string) => {
      if (labelFormatter) return labelFormatter(provider);
      // Default fallback formatting for when no formatter is passed (e.g. in Replies)
      const p = provider.toLowerCase();
      if (p === 'openai') return 'OpenAI';
      if (p === 'xai') return 'xAI (Grok)';
      if (p === 'gemini') return 'Google Gemini';
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={providers.length === 0}
        className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 flex items-center justify-between transition-all outline-none group ${providers.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-600 focus:ring-2 focus:ring-primary/50'}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selected ? (
            <>
              <div className="p-1 bg-slate-800 rounded-md border border-slate-700/50 flex-shrink-0">
                {getProviderIcon(selected.provider, 16)}
              </div>
              <span className="text-white text-sm font-medium truncate capitalize">{getProviderLabel(selected.provider)}</span>
            </>
          ) : (
             <span className="text-slate-400 text-sm">Select Provider</span>
          )}
        </div>
        <ChevronDown size={16} className={`text-slate-500 group-hover:text-slate-300 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && providers.length > 0 && (
        <div className="absolute z-[100] top-full left-0 w-full mt-2 bg-surface border border-slate-700 rounded-xl shadow-xl shadow-black/50 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100 origin-top">
          <div className="p-1 space-y-0.5">
            {providers.map((api) => (
              <button
                key={api.provider}
                onClick={() => {
                  onSelect(api.provider);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left group ${
                  api.provider === selectedProvider ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                }`}
              >
                <div className={`p-1.5 rounded-md border flex-shrink-0 ${api.provider === selectedProvider ? 'bg-slate-900 border-slate-600' : 'bg-slate-900/50 border-slate-800 group-hover:border-slate-700'}`}>
                    {getProviderIcon(api.provider, 16)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                     <p className={`text-sm font-medium truncate capitalize ${api.provider === selectedProvider ? 'text-white' : 'text-slate-300'}`}>{getProviderLabel(api.provider)}</p>
                     {api.provider === selectedProvider && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
