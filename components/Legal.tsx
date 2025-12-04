import React from 'react';

export const Legal: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade-in pb-20">
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">Privacy Policy</h2>
        <div className="bg-surface border border-slate-700 rounded-2xl p-8 space-y-4 text-slate-300 leading-relaxed">
          <p>Last updated: October 26, 2023</p>
          <p>
            This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service.
          </p>
          <h3 className="text-xl font-semibold text-white mt-4">Data Collection</h3>
          <p>
            We do not store your Facebook Access Tokens, App IDs, or API keys on our servers. All sensitive credentials are stored locally in your browser's storage (LocalStorage) or strictly in memory during your session.
          </p>
          <h3 className="text-xl font-semibold text-white mt-4">Third-Party AI Services</h3>
          <p>
            This application connects directly to third-party AI providers (Google Gemini, OpenAI, etc.) using the keys you provide. Your data (posts, comments) is sent to these providers solely for the purpose of generating content or replies as requested by you.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-white mb-6">Terms of Service</h2>
        <div className="bg-surface border border-slate-700 rounded-2xl p-8 space-y-4 text-slate-300 leading-relaxed">
          <h3 className="text-xl font-semibold text-white">1. Acceptance</h3>
          <p>
            By accessing and using Mychat Vibes Pilot, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
          <h3 className="text-xl font-semibold text-white mt-4">2. Usage</h3>
          <p>
            You agree to use the automation features responsibly and in accordance with Facebook's Terms of Service and Platform Policies. We are not responsible for any actions taken by Facebook against your connected pages due to spam-like behavior or automation misuse.
          </p>
          <h3 className="text-xl font-semibold text-white mt-4">3. Disclaimer</h3>
          <p>
            The Service is provided "AS IS". We make no warranties regarding the accuracy of AI-generated content. You are responsible for reviewing all automated replies and posts.
          </p>
        </div>
      </section>
    </div>
  );
};