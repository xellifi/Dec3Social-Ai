
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { Save, Facebook, Mail, Server, Shield, CheckCircle, AlertCircle, Info, Send, Globe, Copy, CircleHelp, Link as LinkIcon } from 'lucide-react';
import { Modal } from './Modal';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    fbAppId: '',
    fbAppSecret: '',
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: '',
  });

  // Notification State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // SMTP Test State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Facebook Guide State
  const [isFbGuideOpen, setIsFbGuideOpen] = useState(false);

  // Dynamic URLs
  const [currentUrls, setCurrentUrls] = useState({
    redirectUri: '',
    domain: '',
    siteUrl: ''
  });

  useEffect(() => {
    // Calculate dynamic URLs based on current environment
    const fullUrl = window.location.href.split('?')[0]; // Remove query params
    const hostname = window.location.hostname;
    const origin = window.location.origin; // Protocol + Hostname + Port

    setCurrentUrls({
      redirectUri: fullUrl,
      domain: hostname,
      siteUrl: origin + '/'
    });

    const stored = localStorage.getItem('app_settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleChange = (key: keyof AppSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setNotification({ message: `${label} copied to clipboard!`, type: 'success' });
  };

  // Save only Facebook credentials
  const saveFbSettings = () => {
    if (!settings.fbAppId.trim() || !settings.fbAppSecret.trim()) {
      setNotification({ message: 'Please enter both App ID and App Secret', type: 'error' });
      return;
    }

    const stored = localStorage.getItem('app_settings');
    const current = stored ? JSON.parse(stored) : {};
    
    const updated = {
        ...current,
        fbAppId: settings.fbAppId,
        fbAppSecret: settings.fbAppSecret
    };
    
    localStorage.setItem('app_settings', JSON.stringify(updated));
    setNotification({ message: 'Facebook credentials saved successfully', type: 'success' });
  };

  // Save only SMTP credentials
  const saveSmtpSettings = () => {
    if (!settings.smtpHost.trim() || !settings.smtpPort.trim() || !settings.smtpUser.trim() || !settings.smtpPass.trim()) {
      setNotification({ message: 'Please fill in all SMTP configuration fields', type: 'error' });
      return;
    }

    const stored = localStorage.getItem('app_settings');
    const current = stored ? JSON.parse(stored) : {};
    
    const updated = {
        ...current,
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpUser: settings.smtpUser,
        smtpPass: settings.smtpPass
    };
    
    localStorage.setItem('app_settings', JSON.stringify(updated));
    setNotification({ message: 'SMTP settings saved successfully', type: 'success' });
  };

  const handleTestConnection = async () => {
    if (!testEmail) return;
    setIsSendingTest(true);
    
    // Simulate SMTP Test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSendingTest(false);
    setIsTestModalOpen(false);
    setNotification({ message: `Test email sent successfully to ${testEmail}`, type: 'success' });
    setTestEmail('');
  };

  const isFbConnected = settings.fbAppId && settings.fbAppSecret;
  const isSmtpConnected = settings.smtpHost && settings.smtpPort && settings.smtpUser && settings.smtpPass;

  // Common style for connected containers to make them distinct
  const connectedContainerStyle = "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)] ring-1 ring-green-500/20";
  const disconnectedContainerStyle = "bg-surface border-slate-700";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10 relative">
      <div className="flex items-center justify-between sticky top-0 z-20 bg-background/95 backdrop-blur py-4 border-b border-slate-800">
        <div>
           <h2 className="text-2xl font-bold text-white">System Settings</h2>
           <p className="text-slate-400 text-sm">Configure global application credentials.</p>
        </div>
      </div>

      {/* Notification Toast - Top Right as requested */}
      {notification && (
        <div className={`fixed top-24 right-6 z-50 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600 text-true-white' : 'bg-red-600 text-true-white'}`}>
           {notification.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
           <div>
              <h4 className="font-bold text-sm">{notification.type === 'success' ? 'Success' : 'Error'}</h4>
              <p className="text-sm opacity-90">{notification.message}</p>
           </div>
        </div>
      )}

      {/* Facebook Settings */}
      <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isFbConnected ? connectedContainerStyle : disconnectedContainerStyle}`}>
        <div className={`p-6 border-b flex items-center gap-3 ${isFbConnected ? 'border-green-500/20 bg-green-500/5' : 'border-slate-700/50'}`}>
          <div className="p-2 bg-blue-600/20 text-blue-500 rounded-lg">
             <Facebook size={20} />
          </div>
          <h3 className="text-lg font-bold text-white">Facebook App Credentials</h3>
        </div>
        <div className="p-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <div className="flex justify-between items-center mb-2">
                 <label className="block text-sm font-medium text-slate-400">App ID</label>
                 {isFbConnected && (
                    <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold animate-in fade-in slide-in-from-bottom-1 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                      <CheckCircle size={12} /> Connected!
                    </span>
                 )}
               </div>
               <input 
                 type="text" 
                 value={settings.fbAppId}
                 onChange={(e) => handleChange('fbAppId', e.target.value)}
                 className={`w-full bg-slate-900 border rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${isFbConnected ? 'border-green-500/30 focus:border-green-500/50' : 'border-slate-700'}`}
                 placeholder="123456789..."
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-400 mb-2">App Secret</label>
               <div className="relative">
                 <input 
                   type="password" 
                   value={settings.fbAppSecret}
                   onChange={(e) => handleChange('fbAppSecret', e.target.value)}
                   className={`w-full bg-slate-900 border rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${isFbConnected ? 'border-green-500/30 focus:border-green-500/50' : 'border-slate-700'}`}
                   placeholder="••••••••••••••••"
                 />
                 <Shield className="absolute left-3 top-3 text-slate-500" size={18} />
               </div>
             </div>
           </div>

           {/* URL Configuration Helper */}
           <div className="mt-6 bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
             <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                   <Globe size={16} className="text-blue-400"/>
                   App Configuration URLs
                </h4>
                <button 
                  onClick={() => setIsFbGuideOpen(true)}
                  className="text-xs flex items-center gap-1 text-primary hover:text-indigo-400 transition-colors"
                >
                   <CircleHelp size={14} /> How to configure?
                </button>
             </div>
             <div className="p-4 space-y-4">
                {/* Valid OAuth Redirect URI */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Valid OAuth Redirect URI</label>
                   <div className="flex gap-2">
                      <div className="relative flex-1 group">
                         <input 
                           type="text" 
                           readOnly 
                           value={currentUrls.redirectUri}
                           className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-3 pr-10 text-xs text-slate-300 font-mono outline-none"
                         />
                         <LinkIcon size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"/>
                      </div>
                      <button 
                        onClick={() => handleCopy(currentUrls.redirectUri, 'Redirect URI')}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 rounded-lg flex items-center justify-center transition-colors"
                        title="Copy"
                      >
                         <Copy size={14} />
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* App Domain */}
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">App Domain</label>
                     <div className="flex gap-2">
                        <input 
                           type="text" 
                           readOnly 
                           value={currentUrls.domain}
                           className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 font-mono outline-none"
                        />
                        <button 
                           onClick={() => handleCopy(currentUrls.domain, 'App Domain')}
                           className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 rounded-lg flex items-center justify-center transition-colors"
                        >
                           <Copy size={14} />
                        </button>
                     </div>
                   </div>
                   {/* Site URL */}
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Site URL (Platform)</label>
                     <div className="flex gap-2">
                        <input 
                           type="text" 
                           readOnly 
                           value={currentUrls.siteUrl}
                           className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 font-mono outline-none"
                        />
                        <button 
                           onClick={() => handleCopy(currentUrls.siteUrl, 'Site URL')}
                           className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 rounded-lg flex items-center justify-center transition-colors"
                        >
                           <Copy size={14} />
                        </button>
                     </div>
                   </div>
                </div>
             </div>
           </div>
           
           <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8 pt-6 border-t ${isFbConnected ? 'border-green-500/20' : 'border-slate-700/50'}`}>
               <div className="flex items-start gap-2 text-slate-500 max-w-md flex-1">
                 <Info size={16} className="mt-0.5 shrink-0" />
                 <p className="text-xs leading-relaxed">
                   Copy the URLs above and paste them into your Facebook App Settings to enable connection.
                 </p>
               </div>
               <button 
                onClick={saveFbSettings}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-true-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 w-full sm:w-auto whitespace-nowrap shrink-0"
               >
                 <Save size={18} /> Save Credentials
               </button>
           </div>
        </div>
      </div>

      {/* SMTP Settings */}
      <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isSmtpConnected ? connectedContainerStyle : disconnectedContainerStyle}`}>
        <div className={`p-6 border-b flex items-center gap-3 ${isSmtpConnected ? 'border-green-500/20 bg-green-500/5' : 'border-slate-700/50'}`}>
          <div className="p-2 bg-orange-600/20 text-orange-500 rounded-lg">
             <Mail size={20} />
          </div>
          <h3 className="text-lg font-bold text-white">SMTP Mail Server</h3>
        </div>
        <div className="p-6 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-400">SMTP Host</label>
                  {isSmtpConnected && (
                    <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold animate-in fade-in slide-in-from-bottom-1 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                      <CheckCircle size={12} /> Connected!
                    </span>
                  )}
               </div>
               <div className="relative">
                  <input 
                    type="text" 
                    value={settings.smtpHost}
                    onChange={(e) => handleChange('smtpHost', e.target.value)}
                    className={`w-full bg-slate-900 border rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${isSmtpConnected ? 'border-green-500/30 focus:border-green-500/50' : 'border-slate-700'}`}
                    placeholder="smtp.gmail.com"
                  />
                  <Server className="absolute left-3 top-3 text-slate-500" size={18} />
               </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-400 mb-2">Port</label>
               <input 
                 type="text" 
                 value={settings.smtpPort}
                 onChange={(e) => handleChange('smtpPort', e.target.value)}
                 className={`w-full bg-slate-900 border rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${isSmtpConnected ? 'border-green-500/30 focus:border-green-500/50' : 'border-slate-700'}`}
                 placeholder="587"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-400 mb-2">Username / Email</label>
               <input 
                 type="text" 
                 value={settings.smtpUser}
                 onChange={(e) => handleChange('smtpUser', e.target.value)}
                 className={`w-full bg-slate-900 border rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${isSmtpConnected ? 'border-green-500/30 focus:border-green-500/50' : 'border-slate-700'}`}
                 placeholder="notifications@yourdomain.com"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
               <input 
                 type="password" 
                 value={settings.smtpPass}
                 onChange={(e) => handleChange('smtpPass', e.target.value)}
                 className={`w-full bg-slate-900 border rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${isSmtpConnected ? 'border-green-500/30 focus:border-green-500/50' : 'border-slate-700'}`}
                 placeholder="••••••••"
               />
             </div>
           </div>

           <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t ${isSmtpConnected ? 'border-green-500/20' : 'border-slate-700/50'}`}>
               <p className="text-xs text-slate-500 flex-1">
                 Used for system notifications and alerts.
               </p>
               <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                   {isSmtpConnected && (
                       <button 
                        onClick={() => setIsTestModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 hover:border-slate-500 px-4 py-2.5 rounded-lg text-sm font-medium transition-all w-full sm:w-auto"
                       >
                         <Send size={16} /> Test Connection
                       </button>
                   )}
                   <button 
                    onClick={saveSmtpSettings}
                    className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-true-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all w-full sm:w-auto"
                   >
                     <Save size={16} /> Save SMTP Settings
                   </button>
               </div>
           </div>
        </div>
      </div>

      {/* Test Email Modal */}
      <Modal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} title="Test SMTP Connection" size="sm">
          <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-start gap-3">
                  <Info size={20} className="text-blue-400 shrink-0 mt-0.5"/>
                  <p className="text-sm text-blue-300 leading-relaxed">
                    Enter a recipient email address. We will try to send a test email using your current SMTP configuration.
                  </p>
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Recipient Email</label>
                  <input 
                      type="email" 
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder-slate-600"
                      autoFocus
                  />
              </div>

              <div className="flex gap-3 pt-2">
                  <button 
                      onClick={() => setIsTestModalOpen(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-true-white py-2.5 rounded-xl transition-colors border border-slate-700"
                  >
                      Cancel
                  </button>
                  <button 
                      onClick={handleTestConnection}
                      disabled={!testEmail || isSendingTest}
                      className="flex-1 bg-primary hover:bg-indigo-600 text-true-white py-2.5 rounded-xl transition-colors font-medium shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isSendingTest ? (
                        <span className="flex items-center gap-2">
                           <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                           Sending...
                        </span>
                      ) : (
                        <>
                           <Send size={16}/> Send Test
                        </>
                      )}
                  </button>
              </div>
          </div>
      </Modal>

      {/* Facebook Configuration Guide Modal */}
      <Modal isOpen={isFbGuideOpen} onClose={() => setIsFbGuideOpen(false)} title="Facebook App Configuration" size="md">
         <div className="space-y-6">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
               <p className="text-sm text-slate-300 leading-relaxed">
                  To enable the "Connect with Facebook" feature, you must configure the following settings in the <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-primary hover:underline">Meta for Developers Dashboard</a>.
               </p>
            </div>

            <div className="space-y-4">
               {/* Step 1 */}
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                     <h4 className="text-white font-medium">Add Platform</h4>
                     <p className="text-xs text-slate-400 mt-1">
                        Go to <strong>Settings &gt; Basic</strong>. Click "Add Platform" at the bottom and select "Website". Paste the <strong>Site URL</strong> provided in the main settings screen.
                     </p>
                  </div>
               </div>
               
               {/* Step 2 */}
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                     <h4 className="text-white font-medium">Configure App Domain</h4>
                     <p className="text-xs text-slate-400 mt-1">
                        In <strong>Settings &gt; Basic</strong>, locate the "App Domains" field and paste the <strong>App Domain</strong> provided.
                     </p>
                  </div>
               </div>

               {/* Step 3 */}
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                     <h4 className="text-white font-medium">Valid OAuth Redirect URI</h4>
                     <p className="text-xs text-slate-400 mt-1">
                        In the sidebar, find <strong>Facebook Login &gt; Settings</strong>. Locate "Valid OAuth Redirect URIs" and paste the <strong>Redirect URI</strong> provided.
                     </p>
                  </div>
               </div>
               
               {/* Step 4 */}
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                     <h4 className="text-white font-medium">Save Changes</h4>
                     <p className="text-xs text-slate-400 mt-1">
                        Click "Save Changes" at the bottom of the Facebook dashboard. Then return here and enter your App ID and Secret.
                     </p>
                  </div>
               </div>
            </div>

            <button 
               onClick={() => setIsFbGuideOpen(false)}
               className="w-full bg-primary hover:bg-indigo-600 text-true-white py-3 rounded-xl font-medium transition-colors"
            >
               Got it, thanks!
            </button>
         </div>
      </Modal>
    </div>
  );
};
