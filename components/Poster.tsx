import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ConnectedPage, ScheduledPost, ApiConfig } from '../types';
import { Calendar, Clock, Sparkles, Image as ImageIcon, Video, Send, Trash, Upload, Wand2, Type, Bot, AlertCircle, ChevronRight } from 'lucide-react';
import { generatePostContent, generateImageContent, suggestCaptionFormat, generateCaptionFromFormat } from '../services/geminiService';
import { PageSelector } from './PageSelector';
import { ApiSelector } from './ApiSelector';

interface PosterProps {
  pages: ConnectedPage[];
  scheduledPosts: ScheduledPost[];
  setScheduledPosts: React.Dispatch<React.SetStateAction<ScheduledPost[]>>;
  apiConfigs: ApiConfig[];
}

// Capability map to define which provider can do what
const PROVIDER_CAPABILITIES = {
  openai: ['text', 'image'],
  gemini: ['text', 'image', 'video'],
  anthropic: ['text'],
  deepseek: ['text'],
  veo: ['video'],
  mistral: ['text'],
  xai: ['text'],
  cohere: ['text'],
  stability: ['image'],
  runway: ['video'],
  luma: ['video'],
};

export const Poster: React.FC<PosterProps> = ({ pages, scheduledPosts, setScheduledPosts, apiConfigs }) => {
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id || '');
  const [prompt, setPrompt] = useState('');
  
  // Content States
  const [captionFormat, setCaptionFormat] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isSuggestingFormat, setIsSuggestingFormat] = useState(false);

  const [scheduleDate, setScheduleDate] = useState('');
  const [recurrence, setRecurrence] = useState<ScheduledPost['recurrence']>('once');
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'video'>('text');
  
  // API Selection State
  const [selectedApiProvider, setSelectedApiProvider] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formatInputRef = useRef<HTMLTextAreaElement>(null);

  // Filter available providers based on selected media type
  const availableProviders = useMemo(() => {
    return apiConfigs.filter(config => 
      config.isActive && 
      config.apiKey && 
      PROVIDER_CAPABILITIES[config.provider as keyof typeof PROVIDER_CAPABILITIES]?.includes(mediaType)
    );
  }, [apiConfigs, mediaType]);

  // Update selected provider when available providers change
  useEffect(() => {
    if (availableProviders.length > 0) {
      // Keep current if valid, otherwise switch to first available
      if (!availableProviders.find(p => p.provider === selectedApiProvider)) {
        setSelectedApiProvider(availableProviders[0].provider);
      }
    } else {
      setSelectedApiProvider('');
    }
  }, [availableProviders, selectedApiProvider]);

  // Auto-resize the format textarea based on content
  useEffect(() => {
    if (formatInputRef.current) {
      formatInputRef.current.style.height = 'auto';
      formatInputRef.current.style.height = `${formatInputRef.current.scrollHeight}px`;
    }
  }, [captionFormat]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to get key for service calls
  const getActiveKey = () => {
    return apiConfigs.find(c => c.provider === selectedApiProvider)?.apiKey;
  };

  const handleGenerateImage = async () => {
    if (!prompt || !selectedApiProvider) return;
    setIsGeneratingImage(true);
    
    try {
      // Note: Currently only Gemini implemented in service. 
      // In real app, would switch based on selectedApiProvider
      const result = await generateImageContent(prompt, uploadedImage || undefined, getActiveKey());
      if (result) {
        setGeneratedImage(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSuggestFormat = async () => {
    if (!selectedApiProvider) return; // Should ideally check for text capability, but simple check is ok
    setIsSuggestingFormat(true);
    try {
      const format = await suggestCaptionFormat(getActiveKey());
      setCaptionFormat(format);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggestingFormat(false);
    }
  };

  const handleGenerateCaption = async () => {
    if ((!prompt && !captionFormat) || !selectedApiProvider) return;
    setIsGeneratingCaption(true);
    try {
      const topic = prompt || "A beautiful day";
      const format = captionFormat || "Standard social media post";
      const result = await generateCaptionFromFormat(topic, format, getActiveKey());
      setGeneratedText(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // Unified generation handler for text mode
  const handleGenerateTextOnly = async () => {
     if (!prompt || !selectedApiProvider) return;
     setIsGeneratingCaption(true);
     try {
        const pageName = pages.find(p => p.id === selectedPageId)?.name || 'Facebook';
        const content = await generatePostContent(prompt, pageName, 'Professional', getActiveKey());
        setGeneratedText(content);
     } catch(e) {
       console.error(e);
     } finally {
       setIsGeneratingCaption(false);
     }
  };

  const handleSchedule = () => {
    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      pageId: selectedPageId,
      content: generatedText || prompt, 
      mediaType,
      mediaUrl: generatedImage || uploadedImage || undefined,
      scheduledTime: scheduleDate,
      status: 'queued',
      recurrence
    };
    setScheduledPosts([newPost, ...scheduledPosts]);
    
    // Reset form partially
    setGeneratedText('');
    setGeneratedImage(null);
    setUploadedImage(null);
    setPrompt('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string) => {
    setScheduledPosts(scheduledPosts.filter(p => p.id !== id));
  };

  const formatProviderLabel = (provider: string) => {
     const p = provider.toLowerCase();
     if (p === 'gemini') return 'Google Gemini';
     if (p === 'anthropic') return 'Claude';
     if (p === 'veo') return 'Google Veo';
     if (p === 'openai') return 'OpenAI';
     if (p === 'mistral') return 'Mistral AI';
     if (p === 'xai') return 'Grok (xAI)';
     if (p === 'stability') return 'Stability AI';
     if (p === 'luma') return 'Luma Dream Machine';
     return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  return (
    <div className="space-y-6 animate-fade-in md:h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-3xl font-bold text-white">Smart Poster</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:h-full min-h-0">
        {/* Creation Column */}
        <div className="lg:col-span-7 space-y-6 md:overflow-y-auto custom-scrollbar md:pr-2">
          <div className="bg-surface border border-slate-700 rounded-2xl p-6 space-y-5">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="text-secondary" size={20}/> Create New Post
            </h3>

            {/* Top Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Select Page</label>
                <PageSelector 
                  pages={pages} 
                  selectedPageId={selectedPageId} 
                  onSelect={setSelectedPageId} 
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Post Type</label>
                <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700">
                    <button 
                      onClick={() => setMediaType('text')}
                      className={`flex-1 py-2 rounded-md text-sm flex items-center justify-center gap-2 ${mediaType === 'text' ? 'bg-slate-700 text-true-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >Text</button>
                    <button 
                      onClick={() => setMediaType('image')}
                      className={`flex-1 py-2 rounded-md text-sm flex items-center justify-center gap-2 ${mediaType === 'image' ? 'bg-slate-700 text-true-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    ><ImageIcon size={16}/></button>
                    <button 
                      onClick={() => setMediaType('video')}
                      className={`flex-1 py-2 rounded-md text-sm flex items-center justify-center gap-2 ${mediaType === 'video' ? 'bg-slate-700 text-true-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    ><Video size={16}/></button>
                </div>
              </div>
            </div>

            {/* AI Model Selection */}
            <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-700/50">
               <div className="flex items-center justify-between mb-2">
                 <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                   <Bot size={14} className="text-primary"/> API Provider
                 </label>
                 {availableProviders.length > 0 && (
                    <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                       For {mediaType} generation
                    </span>
                 )}
               </div>
               
               {availableProviders.length > 0 ? (
                 <ApiSelector 
                    providers={availableProviders}
                    selectedProvider={selectedApiProvider}
                    onSelect={setSelectedApiProvider}
                    labelFormatter={formatProviderLabel}
                 />
               ) : (
                 <div className="text-red-400 text-xs flex items-start gap-2 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                    <AlertCircle size={14} className="shrink-0 mt-0.5"/>
                    <div>
                       <p className="font-medium">No AI provider available for {mediaType}.</p>
                       <p className="opacity-80 mt-1">Please configure a compatible API key in Settings.</p>
                    </div>
                 </div>
               )}
            </div>

            {/* Image Specific Area */}
            {mediaType === 'image' && (
              <div className="space-y-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                 <label className="block text-sm font-medium text-slate-300">Image Reference & Generation</label>
                 
                 {/* Upload Area */}
                 <div className="grid grid-cols-2 gap-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-600 hover:border-secondary rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors h-40 relative overflow-hidden group"
                    >
                       {uploadedImage ? (
                         <>
                           <img src={uploadedImage} alt="Reference" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                           <div className="relative z-10 bg-black/50 p-2 rounded-full">
                             <Upload size={20} className="text-true-white" />
                           </div>
                           <span className="relative z-10 text-xs text-white mt-2 font-medium">Change Reference</span>
                         </>
                       ) : (
                         <>
                           <Upload size={24} className="text-slate-400 mb-2" />
                           <span className="text-xs text-slate-400 text-center">Upload Reference<br/>Image (Optional)</span>
                         </>
                       )}
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         onChange={handleImageUpload} 
                         accept="image/*" 
                         className="hidden" 
                       />
                    </div>

                    {/* Result Preview */}
                    <div className="border border-slate-700 bg-slate-800 rounded-xl p-1 flex items-center justify-center h-40 relative overflow-hidden">
                       {generatedImage ? (
                          <img src={generatedImage} alt="Generated" className="w-full h-full object-cover rounded-lg" />
                       ) : (
                          <div className="text-center p-4">
                            {isGeneratingImage ? (
                              <div className="animate-spin w-6 h-6 border-2 border-secondary border-t-transparent rounded-full mx-auto mb-2"></div>
                            ) : (
                              <Sparkles size={24} className="text-slate-600 mx-auto mb-2" />
                            )}
                            <span className="text-xs text-slate-500">{isGeneratingImage ? 'Generating...' : 'AI Output will appear here'}</span>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            )}

            {/* Prompt Area */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {mediaType === 'image' ? 'AI Instructions (Topic / Describe the image)' : 'Topic / Prompt'}
              </label>
              <div className="relative">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white min-h-[80px] focus:ring-2 focus:ring-secondary outline-none resize-none"
                  placeholder={mediaType === 'image' 
                    ? "e.g., Make me look like I'm on a sunset beach with a dog..." 
                    : "e.g., A post about our summer sale with emojis..."}
                />
                {mediaType === 'image' && (
                  <button 
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !prompt || !selectedApiProvider}
                    className="absolute bottom-3 right-3 bg-secondary hover:bg-purple-600 text-true-white px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 font-medium shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingImage ? 'Generating Image...' : <><Sparkles size={14}/> Generate Image</>}
                  </button>
                )}
                {mediaType === 'text' && (
                   <button 
                    onClick={handleGenerateTextOnly}
                    disabled={isGeneratingCaption || !prompt || !selectedApiProvider}
                    className="absolute bottom-3 right-3 bg-primary hover:bg-indigo-600 text-true-white px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 font-medium shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingCaption ? 'Writing...' : <><Wand2 size={14}/> Write Post</>}
                  </button>
                )}
              </div>
            </div>

            {/* Caption Format Area - Specifically for Image/Video (or advanced text) */}
            <div className="pt-2">
               <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium text-slate-300">
                    <span className="flex items-center gap-2"><Type size={16} className="text-blue-400"/> Format</span>
                  </label>
                  <button 
                    onClick={handleSuggestFormat}
                    disabled={isSuggestingFormat || !selectedApiProvider}
                    className="text-xs flex items-center gap-1 text-secondary hover:text-purple-400 transition-colors disabled:opacity-50"
                  >
                     <Wand2 size={12} /> {isSuggestingFormat ? 'Thinking...' : 'Suggest Format'}
                  </button>
               </div>
               
               <div className="relative group">
                  <textarea 
                    ref={formatInputRef}
                    value={captionFormat}
                    onChange={(e) => setCaptionFormat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 pb-20 text-white min-h-[150px] md:min-h-[250px] focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm resize-none overflow-hidden"
                    placeholder={`❤️ Oh! What i nice place. 🌨️\nLet's gooooo! Let's swim? 👙\n\n#beach #sunset #trendingtoday`}
                  />
                  <div className="absolute bottom-3 right-3">
                     <button 
                        onClick={handleGenerateCaption}
                        disabled={isGeneratingCaption || !prompt || !selectedApiProvider}
                        className="bg-blue-600 hover:bg-blue-700 text-true-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-lg flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {isGeneratingCaption ? 'Writing...' : <><Sparkles size={14}/> Show</>}
                     </button>
                  </div>
               </div>
               <p className="text-[10px] text-slate-500 mt-1">
                 Enter a format structure above. The AI will generate the final caption based on your Prompt/Topic following this style.
               </p>
            </div>

            {/* Final Content Editor */}
            <div>
               <label className="block text-sm text-slate-400 mb-2">Final Post Caption</label>
               <textarea 
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white min-h-[80px] focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Final caption will appear here..."
               />
            </div>

            {/* Scheduling */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Recurrence</label>
                <select 
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none"
                >
                  <option value="once">One-time</option>
                  <option value="30m">Every 30 Mins</option>
                  <option value="1h">Hourly</option>
                  <option value="3h">Every 3 Hours</option>
                  <option value="6h">Every 6 Hours</option>
                  <option value="12h">Every 12 Hours</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              
               <div>
                <label className="block text-sm text-slate-400 mb-2">Schedule Time</label>
                <input 
                  type="datetime-local" 
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handleSchedule}
              disabled={!scheduleDate || (!generatedText && !generatedImage && !uploadedImage)}
              className="w-full bg-primary hover:bg-indigo-600 text-true-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              <Clock size={20} /> Schedule Post
            </button>
          </div>
        </div>

        {/* Queue Column */}
        <div className="lg:col-span-5 flex flex-col md:h-full min-h-0">
          <div className="bg-surface border border-slate-700 rounded-2xl p-6 flex flex-col h-full md:max-h-[calc(100vh-140px)]">
             <div className="flex justify-between items-center mb-6 shrink-0">
               <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Calendar className="text-blue-400" size={20}/> Activity Log
              </h3>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">{scheduledPosts.length} items</span>
             </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 min-h-[300px] md:min-h-0">
              {scheduledPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 min-h-[150px]">
                   <Calendar size={48} className="mb-2 opacity-20"/>
                   <p>No posts scheduled.</p>
                </div>
              ) : (
                scheduledPosts.map((post) => (
                  <div key={post.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 group hover:border-slate-600 transition-colors">
                    <div className="flex gap-4">
                       {/* Media Preview */}
                       <div className="w-16 h-16 shrink-0 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                          {post.mediaUrl ? (
                            <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                          ) : (
                            post.mediaType === 'video' ? <Video size={24} className="text-slate-500"/> : <Send size={24} className="text-slate-500"/>
                          )}
                       </div>
                       
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                             <div className="flex items-center gap-2 min-w-0">
                                {/* Page Owner Avatar */}
                                <img 
                                  src={pages.find(p=>p.id === post.pageId)?.avatarUrl || "https://via.placeholder.com/20"} 
                                  alt="Page" 
                                  className="w-5 h-5 rounded-full border border-slate-600 shrink-0"
                                />
                                <p className="text-white text-sm font-medium truncate pr-2">{pages.find(p=>p.id === post.pageId)?.name || 'Page'}</p>
                             </div>
                             <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border font-semibold tracking-wide shrink-0 ${
                               post.status === 'published' 
                               ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                               : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                             }`}>
                               {post.status}
                             </span>
                          </div>
                          
                          <p className="text-slate-400 text-xs line-clamp-2 mb-2">{post.content || 'No caption'}</p>
                          
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                             <span className="flex items-center gap-1">
                               <Clock size={10} /> {new Date(post.scheduledTime).toLocaleDateString()}
                             </span>
                             <span className="capitalize flex items-center gap-1">
                               <Calendar size={10} /> {post.recurrence}
                             </span>
                          </div>
                       </div>
                       
                       <button 
                          onClick={() => handleDelete(post.id)}
                          className="text-slate-600 hover:text-red-400 transition-colors self-center -mr-1 p-1"
                        >
                          <Trash size={16} />
                        </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};