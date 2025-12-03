
import React from 'react';
import { BookOpen, Facebook, Cpu, Shield, X } from 'lucide-react';

interface GuideProps {
  onClose: () => void;
}

export const Guide: React.FC<GuideProps> = ({ onClose }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-4 relative">
      <button 
        onClick={onClose}
        className="absolute top-0 right-0 p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
      >
        <X size={24} />
      </button>

      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Documentation</h2>
        <p className="text-slate-400 mt-2">Learn how to use AutoSocial AI effectively.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Getting Started */}
        <div className="bg-surface border border-slate-700 p-6 rounded-2xl space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary mb-2">
            <Facebook size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white">Connecting Facebook</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            To automate your page, you need a Page Access Token.
            <br/><br/>
            1. Go to <a href="#" className="text-primary hover:underline">Facebook Developers</a>.
            <br/>
            2. Create an App and add the "Facebook Login" product.
            <br/>
            3. Generate a Page Access Token with `pages_manage_posts` and `pages_messaging` permissions.
            <br/>
            4. Enter the App ID and Token in the Dashboard.
          </p>
        </div>

        {/* AI Setup */}
        <div className="bg-surface border border-slate-700 p-6 rounded-2xl space-y-4">
          <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center text-secondary mb-2">
            <Cpu size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white">Training the AI</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Each page has its own "Brain".
            <br/><br/>
            1. Click "Train AI" on your dashboard card.
            <br/>
            2. Input details about your business (Hours, Policies, Tone).
            <br/>
            3. The AI uses Gemini Flash 2.5 to generate context-aware replies based on these instructions.
          </p>
        </div>
      </div>

       {/* Features */}
      <div className="bg-surface border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700">
           <h3 className="text-xl font-semibold text-white flex items-center gap-2"><BookOpen size={20}/> Features Overview</h3>
        </div>
        <div className="p-6 space-y-6">
           <div>
             <h4 className="text-white font-medium">Auto Replies</h4>
             <p className="text-slate-400 text-sm mt-1">Automatically replies to comments and DMs. You can choose between static keyword matching or dynamic AI generation.</p>
           </div>
           <div>
             <h4 className="text-white font-medium">Smart Poster</h4>
             <p className="text-slate-400 text-sm mt-1">Create content using prompts. The AI generates the caption, and you can attach media. Schedule posts for daily or weekly recurrence.</p>
           </div>
           <div>
             <h4 className="text-white font-medium">Activity Feed</h4>
             <p className="text-slate-400 text-sm mt-1">Real-time view of what's happening on your connected pages. Sort by popularity to find high-engagement posts.</p>
           </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-surface border border-slate-700 rounded-2xl p-6">
         <div className="flex items-center gap-3 mb-4">
            <Shield size={24} className="text-green-400" />
            <h3 className="text-xl font-semibold text-white">Data Privacy</h3>
         </div>
         <p className="text-slate-400 text-sm">
           AutoSocial AI prioritizes your data security. Access tokens and API keys are stored locally on your device. We do not sell or share your data with third parties. Communication with AI providers (OpenAI, Google) is done directly from your client browser.
         </p>
      </div>
    </div>
  );
};
