import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../types';
import { Key, Save, Bot, Sparkles, BrainCircuit, Zap, ExternalLink, MessageSquareText, Image, Video, ScanSearch, Wind, X, Network, Palette, Film, Aperture, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';

interface ApiManagerProps {
  apiConfigs: ApiConfig[];
  setApiConfigs: React.Dispatch<React.SetStateAction<ApiConfig[]>>;
}

const PROVIDER_META: Record<string, { 
  label: string; 
  icon: React.ElementType; 
  color: string; 
  category: 'text' | 'image' | 'video';
  link: string;
  desc: string;
}> = {
  // Text Providers
  openai: { 
    label: 'OpenAI', 
    icon: Bot, 
    color: 'text-green-400', 
    category: 'text',
    link: 'https://platform.openai.com/api-keys',
    desc: 'GPT-4o, GPT-3.5 Turbo'
  },
  deepseek: { 
    label: 'DeepSeek', 
    icon: ScanSearch, 
    color: 'text-blue-400', 
    category: 'text',
    link: 'https://platform.deepseek.com/api_keys',
    desc: 'DeepSeek V3, Coder'
  },
  anthropic: { 
    label: 'Claude (Anthropic)', 
    icon: BrainCircuit, 
    color: 'text-purple-400', 
    category: 'text',
    link: 'https://console.anthropic.com/settings/keys',
    desc: 'Claude 3.5 Sonnet, Opus'
  },
  mistral: { 
    label: 'Mistral AI', 
    icon: Wind, 
    color: 'text-amber-400', 
    category: 'text',
    link: 'https://console.mistral.ai/api-keys/',
    desc: 'Mistral Large, Small, Le Chat'
  },
  xai: { 
    label: 'xAI (Grok)', 
    icon: X, 
    color: 'text-slate-100', 
    category: 'text',
    link: 'https://console.x.ai/',
    desc: 'Grok-1, Grok-2'
  },
  cohere: { 
    label: 'Cohere', 
    icon: Network, 
    color: 'text-teal-400', 
    category: 'text',
    link: 'https://dashboard.cohere.com/api-keys',
    desc: 'Command R, Command R+'
  },

  // Image Providers
  gemini: { 
    label: 'Google Gemini', 
    icon: Sparkles, 
    color: 'text-blue-400', 
    category: 'image',
    link: 'https://aistudio.google.com/app/apikey',
    desc: 'Gemini 2.5 Flash (Image Gen)'
  },
  stability: { 
    label: 'Stability AI', 
    icon: Palette, 
    color: 'text-indigo-400', 
    category: 'image',
    link: 'https://platform.stability.ai/account/keys',
    desc: 'Stable Diffusion 3, SDXL'
  },

  // Video Providers
  veo: { 
    label: 'Google Veo', 
    icon: Video, 
    color: 'text-pink-400', 
    category: 'video',
    link: 'https://aistudio.google.com/app/apikey',
    desc: 'Veo 3.1 Video Generation'
  },
  runway: { 
    label: 'RunwayML', 
    icon: Film, 
    color: 'text-rose-400', 
    category: 'video',
    link: 'https://app.runwayml.com/account/api-keys',
    desc: 'Gen-3 Alpha, Gen-2'
  },
  luma: { 
    label: 'Luma Dream Machine', 
    icon: Aperture, 
    color: 'text-cyan-400', 
    category: 'video',
    link: 'https://lumalabs.ai/dream-machine/api',
    desc: 'Dream Machine Video Generation'
  }
};

export const ApiManager: React.FC<ApiManagerProps> = ({ apiConfigs, setApiConfigs }) => {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSave = () => {
    localStorage.setItem('api_configs', JSON.stringify(apiConfigs));
    setNotification({ message: 'API Keys saved successfully!', type: 'success' });
  };

  const handleChange = (provider: string, value: string) => {
    setApiConfigs(apiConfigs.map(api => api.provider === provider ? { ...api, apiKey: value } : api));
  };

  const toggleActive = (provider: string) => {
    setApiConfigs(apiConfigs.map(api => api.provider === provider ? { ...api, isActive: !api.isActive } : api));
  };

  const toggleExpand = (provider: string) => {
    setExpandedProvider(expandedProvider === provider ? null : provider);
  };

  const renderProviderCard = (api: ApiConfig) => {
    const meta = PROVIDER_META[api.provider] || { label: api.provider, icon: Zap, color: 'text-slate-400', link: '#', desc: '' };
    const Icon = meta.icon;
    const isExpanded = expandedProvider === api.provider;
    const hasKey = api.apiKey && api.apiKey.length > 0;

    // Match styling with Settings.tsx connected state
    const connectedStyle = "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500 shadow-sm ring-1 ring-green-500/20";
    const disconnectedStyle = "bg-slate-900/50 border-slate-700 hover:border-slate-600";

    return (
      <div 
        key={api.provider} 
        className={`border rounded-xl overflow-hidden transition-all duration-300 group ${hasKey ? connectedStyle : disconnectedStyle}`}
      >
        {/* Header Row */}
        <div 
          className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${hasKey ? 'hover:bg-green-500/5' : 'hover:bg-slate-800/40'}`}
          onClick={() => toggleExpand(api.provider)}
        >
          <div className="flex items-center gap-4">
            <div className={`p-2.5 bg-slate-800 rounded-lg border border-slate-700 shrink-0 ${meta.color}`}>
              <Icon size={20} />
            </div>
            
            <div className="flex flex-col">
              <h4 className="text-white font-semibold select-none leading-tight">{meta.label}</h4>
              {hasKey ? (
                 <div className="flex items-center gap-1.5 mt-1 animate-fade-in">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs text-emerald-500 font-medium tracking-wide">Connected</span>
                 </div>
              ) : (
                 <span className="text-[10px] text-slate-500 mt-0.5">Not configured</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Active Toggle - Stop propagation to prevent expanding when toggling switch */}
            <div onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => toggleActive(api.provider)}
                className={`w-10 h-6 rounded-full relative transition-all duration-300 border focus:outline-none ${api.isActive ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-300 dark:bg-slate-700 border-gray-300 dark:border-slate-600'}`}
                title={api.isActive ? "Active" : "Inactive"}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-true-white rounded-full shadow-sm transition-transform duration-300 ${api.isActive ? 'translate-x-4' : 'translate-x-0'}`}></span>
              </button>
            </div>

            <ChevronDown 
              size={20} 
              className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>
        
        {/* Collapsible Body */}
        {isExpanded && (
          <div className={`p-4 border-t animate-fade-in ${hasKey ? 'border-green-500/20 bg-green-500/5' : 'border-slate-700 bg-slate-900/30'}`}>
             <div className="flex items-center justify-between mb-3">
               <p className="text-slate-400 text-xs">{meta.desc}</p>
               <a 
                  href={meta.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-primary hover:text-indigo-300 transition-colors bg-primary/10 px-2 py-1 rounded-md border border-primary/20"
                >
                  <ExternalLink size={10} /> Get Key
                </a>
             </div>
            
             <div className="relative">
               <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
               <input 
                  type="password" 
                  value={api.apiKey}
                  onChange={(e) => handleChange(api.provider, e.target.value)}
                  placeholder={`Paste ${meta.label} API Key`}
                  className={`w-full bg-slate-950 border rounded-lg pl-9 pr-8 py-2.5 text-slate-300 text-sm outline-none transition-all placeholder-slate-600 ${hasKey ? 'border-green-500/40 focus:border-green-500 focus:ring-2 focus:ring-green-500/20' : 'border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary'}`}
                  autoFocus
                />
                {hasKey && (
                   <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in" />
                )}
             </div>
          </div>
        )}
      </div>
    );
  };

  const getProvidersByCategory = (category: 'text' | 'image' | 'video') => {
    return apiConfigs
      .filter(api => PROVIDER_META[api.provider]?.category === category)
      .sort((a, b) => {
        // Prefer logical ordering
        const order = ['openai', 'deepseek', 'anthropic', 'mistral', 'xai', 'cohere', 'gemini', 'stability', 'veo', 'runway', 'luma'];
        return order.indexOf(a.provider) - order.indexOf(b.provider);
      });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10 relative">
      <div className="flex items-center justify-between sticky top-0 z-20 bg-background/95 backdrop-blur py-4 border-b border-slate-800">
        <div>
           <h2 className="text-2xl font-bold text-white">API Management</h2>
           <p className="text-slate-400 text-sm">Configure and manage your AI model providers.</p>
        </div>
         <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-primary hover:bg-indigo-600 text-true-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
           >
             <Save size={18} /> Save Keys
           </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-6 z-50 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600 text-true-white' : 'bg-red-600 text-true-white'}`}>
           {notification.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
           <div>
              <h4 className="font-bold text-sm">{notification.type === 'success' ? 'Success' : 'Error'}</h4>
              <p className="text-sm opacity-90">{notification.message}</p>
           </div>
        </div>
      )}

      {/* Text / Replies Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white pb-2 border-b border-slate-800">
          <MessageSquareText className="text-green-400" size={20}/>
          <h3 className="text-lg font-bold">Text Messaging & Replies</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {getProvidersByCategory('text').map(renderProviderCard)}
        </div>
      </div>

      {/* Image Generation Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white pb-2 border-b border-slate-800">
          <Image className="text-blue-400" size={20}/>
          <h3 className="text-lg font-bold">Image Generation</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
           {getProvidersByCategory('image').map(renderProviderCard)}
        </div>
      </div>

      {/* Video Generation Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white pb-2 border-b border-slate-800">
          <Video className="text-pink-400" size={20}/>
          <h3 className="text-lg font-bold">Video Creation</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
           {getProvidersByCategory('video').map(renderProviderCard)}
        </div>
      </div>

      <div className="bg-surface border border-slate-700 rounded-2xl p-6 mt-8">
         <p className="text-xs text-slate-400 text-center">
           <strong>Note:</strong> All API keys are stored locally in your browser. We do not save them to any server. 
           Ensure you check the pricing for each provider before use.
         </p>
      </div>
    </div>
  );
};