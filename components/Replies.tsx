import React, { useState, useEffect, useMemo } from 'react';
import { ConnectedPage, ApiConfig } from '../types';
import { Zap, Save, RotateCcw, PlayCircle, Bot, AlertCircle, X, Settings, BrainCircuit } from 'lucide-react';
import { PageSelector } from './PageSelector';
import { ApiSelector } from './ApiSelector';
import { Modal } from './Modal';

interface RepliesProps {
  pages: ConnectedPage[];
  setPages: React.Dispatch<React.SetStateAction<ConnectedPage[]>>;
  apiConfigs: ApiConfig[];
  selectedPageId: string;
  setSelectedPageId: (id: string) => void;
  onClose: () => void;
  onNavigateToApiManager: () => void;
}

export const Replies: React.FC<RepliesProps> = ({ pages, setPages, apiConfigs, selectedPageId, setSelectedPageId, onClose, onNavigateToApiManager }) => {
  const [activeTab, setActiveTab] = useState<'comment' | 'dm'>('comment');
  const [useAi, setUseAi] = useState(true);
  
  const [spintaxTemplate, setSpintaxTemplate] = useState(
    "{Hi|Hello|Hey} there! {Thanks|Thank you} for {contacting|messaging|reaching out to} us. We will {get back to you|respond} shortly."
  );
  const [previewText, setPreviewText] = useState('');
  const [selectedApiProvider, setSelectedApiProvider] = useState<string>('');

  // Modal State
  const [isTrainModalOpen, setIsTrainModalOpen] = useState(false);
  const [trainingText, setTrainingText] = useState('');

  // Ensure we have a selection if not provided
  useEffect(() => {
    if (!selectedPageId && pages.length > 0) {
       setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId, setSelectedPageId]);

  // Filter for text-capable providers
  const availableProviders = useMemo(() => {
    return apiConfigs.filter(config => 
      config.isActive && 
      config.apiKey && 
      ['openai', 'gemini', 'anthropic', 'deepseek', 'mistral', 'xai', 'cohere'].includes(config.provider)
    );
  }, [apiConfigs]);

  // Auto-select first available provider
  useEffect(() => {
    if (availableProviders.length > 0) {
      if (!availableProviders.find(p => p.provider === selectedApiProvider)) {
        setSelectedApiProvider(availableProviders[0].provider);
      }
    } else {
      setSelectedApiProvider('');
    }
  }, [availableProviders, selectedApiProvider]);

  useEffect(() => {
    generatePreview();
  }, [spintaxTemplate]);

  const processSpintax = (text: string) => {
    return text.replace(/{([^{}]+)}/g, (match, content) => {
      const options = content.split('|');
      return options[Math.floor(Math.random() * options.length)];
    });
  };

  const generatePreview = () => {
    setPreviewText(processSpintax(spintaxTemplate));
  };

  const handleOpenTrainModal = () => {
    const page = pages.find(p => p.id === selectedPageId);
    if (page) {
        setTrainingText(page.aiInstructions);
        setIsTrainModalOpen(true);
    }
  };

  const saveTraining = () => {
    setPages(pages.map(p => p.id === selectedPageId ? { ...p, aiInstructions: trainingText } : p));
    setIsTrainModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Automation Rules</h2>
        <button 
          onClick={onClose}
          className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Close"
        >
          <X size={24} />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-surface p-4 rounded-2xl border border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
          <div className="w-full sm:w-64">
            <PageSelector 
              pages={pages} 
              selectedPageId={selectedPageId} 
              onSelect={setSelectedPageId} 
            />
          </div>
          
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 w-full sm:w-auto">
             <button 
                onClick={() => setActiveTab('comment')}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'comment' ? 'bg-slate-700 text-true-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
             >Comments</button>
             <button 
                onClick={() => setActiveTab('dm')}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dm' ? 'bg-slate-700 text-true-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
             >Messages</button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            {useAi && (
              <div className="w-full sm:w-40 shrink-0">
                 {availableProviders.length > 0 ? (
                   <ApiSelector 
                      providers={availableProviders}
                      selectedProvider={selectedApiProvider}
                      onSelect={setSelectedApiProvider}
                   />
                 ) : (
                   <div className="flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20 w-full justify-center">
                     <span className="text-[10px] text-red-400 flex items-center gap-1 font-medium">
                       <AlertCircle size={12}/> No API
                     </span>
                   </div>
                 )}
              </div>
            )}

            <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-900/50 px-4 py-2.5 rounded-lg border border-slate-700 w-full sm:w-auto shrink-0">
               <div className="flex items-center gap-2">
                 <Zap size={18} className={useAi ? "text-yellow-400" : "text-slate-500"} />
                 <span className="text-sm text-white font-medium whitespace-nowrap">Use AI Agent</span>
               </div>
               <button 
                  onClick={() => setUseAi(!useAi)}
                  className={`w-11 h-6 rounded-full relative transition-all duration-300 border focus:outline-none ${useAi ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-300 dark:bg-slate-700 border-gray-300 dark:border-slate-600'}`}
               >
                 <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-true-white rounded-full shadow-sm transition-transform duration-300 ${useAi ? 'translate-x-5' : 'translate-x-0'}`}></span>
               </button>
            </div>
        </div>
      </div>

      {/* Configuration Area */}
      <div className="bg-surface border border-slate-700 rounded-2xl overflow-hidden min-h-[400px]">
         {useAi ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
               {availableProviders.length > 0 ? (
                 <>
                   <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-pulse">
                      <Zap size={40} className="text-true-white" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold text-white">AI Agent Active</h3>
                     <p className="text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                       The AI is currently handling {activeTab === 'comment' ? 'comments' : 'direct messages'} for <span className="text-primary font-semibold">{pages.find(p=>p.id===selectedPageId)?.name}</span> using <span className="text-white font-semibold capitalize">{selectedApiProvider}</span>.
                     </p>
                   </div>
                   <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm text-blue-300 max-w-lg w-full">
                     Tip: Go to <strong>Dashboard &gt; Train AI</strong> to update the personality and knowledge base.
                   </div>
                   
                   <button 
                      onClick={handleOpenTrainModal}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-true-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-purple-500/20"
                   >
                      <BrainCircuit size={18} /> Configure Personality
                   </button>
                 </>
               ) : (
                 <div className="flex flex-col items-center text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                       <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Configuration Required</h3>
                    <p className="text-slate-400 text-sm mb-6">
                       You have enabled the AI Agent, but no supported text-generation API (Gemini, OpenAI, Anthropic) is currently active in your settings.
                    </p>
                    <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-lg w-full mb-4">
                       Please go to the API menu and enable a provider to start automating.
                    </div>
                    <button 
                      onClick={onNavigateToApiManager}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-true-white px-5 py-2.5 rounded-xl font-medium transition-colors border border-slate-600 hover:border-slate-500 shadow-lg shadow-black/20"
                    >
                      <Settings size={18} />
                      Configure API Providers
                    </button>
                 </div>
               )}
            </div>
         ) : (
            <div className="p-6 flex flex-col h-full">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Generic Reply Configuration</h3>
                    <p className="text-sm text-slate-400">Define a spintax template for random variations.</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Editor */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <label className="text-sm font-medium text-slate-300">Reply Template</label>
                        <span className="text-xs text-slate-500">Format: &#123;Option A|Option B&#125;</span>
                     </div>
                     <textarea 
                        value={spintaxTemplate}
                        onChange={(e) => setSpintaxTemplate(e.target.value)}
                        className="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                        placeholder="{Hello|Hi}, thanks for {contacting|messaging} us..."
                     />
                     <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-indigo-600 text-true-white px-5 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20">
                        <Save size={18}/> Save Template
                     </button>
                  </div>

                  {/* Preview */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center h-6">
                        <label className="text-sm font-medium text-slate-300">Live Preview</label>
                        <button 
                           onClick={generatePreview}
                           className="text-xs flex items-center gap-1 text-primary hover:text-indigo-400 transition-colors"
                        >
                           <RotateCcw size={12}/> Spin Again
                        </button>
                     </div>
                     
                     <div className="h-64 bg-slate-900/50 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        <p className="text-white text-lg font-medium leading-relaxed">"{previewText}"</p>
                        
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">Preview Mode</span>
                        </div>
                     </div>

                     <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
                        <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                           <PlayCircle size={14}/> How it works
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                           When a new {activeTab === 'comment' ? 'comment' : 'message'} arrives, the system will randomly select one variation from your template. This ensures your automated replies don't look like bots.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* Train AI Modal */}
      <Modal isOpen={isTrainModalOpen} onClose={() => setIsTrainModalOpen(false)} title="Train AI Agent">
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
            <p className="text-sm text-blue-300">
              Provide system instructions for this page. The AI will use this "personality" and knowledge base when replying to comments and DMs.
            </p>
          </div>
          <textarea 
            value={trainingText}
            onChange={(e) => setTrainingText(e.target.value)}
            rows={8}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
            placeholder="e.g., You are a helpful assistant for a Pizza Shop. Our hours are 9am-9pm. We do not deliver on Sundays. Be witty and fun."
          />
          <button 
            onClick={saveTraining}
            className="w-full bg-purple-600 hover:bg-purple-700 text-true-white font-medium py-3 rounded-xl transition-colors"
          >
            Save Knowledge Base
          </button>
        </div>
      </Modal>
    </div>
  );
};