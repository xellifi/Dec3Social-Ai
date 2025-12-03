import React, { useState, useEffect, useRef } from 'react';
import { View } from '../types';
import { LayoutDashboard, Activity as ActivityIcon, Send, Key, FileText, Settings, Bell, Sun, Moon, User, Mail, CheckCircle, AlertCircle, Save, Camera, Lock, Phone, Globe, ChevronDown, X, Search } from 'lucide-react';
import { Modal } from './Modal';

interface LayoutProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  children: React.ReactNode;
  isDarkMode: boolean;
  toggleTheme: () => void;
  unreadNotifications?: number;
}

interface Notification {
  id: number;
  text: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children, isDarkMode, toggleTheme, unreadNotifications: initialUnread = 0 }) => {
  // Profile Modal State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    username: 'admin_sys',
    email: 'admin@autosocial.ai',
    password: '',
    mobile: '555-0123',
    countryCode: '+1',
    role: 'Pro Plan'
  });
  
  // Notification State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, text: 'AI Reply limit reached for "Tech Daily"', time: '2 mins ago', read: false, type: 'warning' },
    { id: 2, text: 'New comment from Sarah on "Summer Sale"', time: '1 hour ago', read: false, type: 'info' },
    { id: 3, text: 'Scheduled post published successfully', time: '3 hours ago', read: false, type: 'success' },
    { id: 4, text: 'System maintenance scheduled for Sunday', time: 'Yesterday', read: true, type: 'info' },
  ]);

  const notificationRef = useRef<HTMLDivElement>(null);

  // Handle click outside for notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);
  
  // Notification Toast State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSaveProfile = () => {
    // In a real app, this would save to backend
    setToast({ message: 'Profile settings saved successfully!', type: 'success' });
    setIsProfileOpen(false);
  };

  const navItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.ACTIVITY, label: 'Activity', icon: ActivityIcon },
    { id: View.POSTER, label: 'Poster', icon: Send },
    { id: View.API_MANAGER, label: 'API Keys', icon: Key },
    { id: View.SETTINGS, label: 'Settings', icon: Settings },
  ];

  const formatTitle = (view: View) => {
    return view.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const countryCodes = [
    { code: '+1', flag: '🇺🇸', name: 'United States', dummy: '555-0123' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom', dummy: '7700 900077' },
    { code: '+1', flag: '🇨🇦', name: 'Canada', dummy: '555-0101' },
    { code: '+61', flag: '🇦🇺', name: 'Australia', dummy: '0400 123 456' },
    { code: '+91', flag: '🇮🇳', name: 'India', dummy: '98123 45678' },
    { code: '+81', flag: '🇯🇵', name: 'Japan', dummy: '90 1234 5678' },
    { code: '+49', flag: '🇩🇪', name: 'Germany', dummy: '1512 3456789' },
    { code: '+33', flag: '🇫🇷', name: 'France', dummy: '06 12 34 56 78' },
    { code: '+55', flag: '🇧🇷', name: 'Brazil', dummy: '11 91234-5678' },
    { code: '+52', flag: '🇲🇽', name: 'Mexico', dummy: '55 1234 5678' },
    { code: '+86', flag: '🇨🇳', name: 'China', dummy: '139 1234 5678' },
    { code: '+7', flag: '🇷🇺', name: 'Russia', dummy: '900 123-45-67' },
    { code: '+39', flag: '🇮🇹', name: 'Italy', dummy: '320 1234567' },
    { code: '+34', flag: '🇪🇸', name: 'Spain', dummy: '612 345 678' },
    { code: '+82', flag: '🇰🇷', name: 'South Korea', dummy: '010-1234-5678' },
    { code: '+62', flag: '🇮🇩', name: 'Indonesia', dummy: '0812-3456-789' },
    { code: '+31', flag: '🇳🇱', name: 'Netherlands', dummy: '06 12345678' },
    { code: '+90', flag: '🇹🇷', name: 'Turkey', dummy: '501 123 45 67' },
    { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', dummy: '50 123 4567' },
    { code: '+971', flag: '🇦🇪', name: 'UAE', dummy: '50 123 4567' },
    { code: '+65', flag: '🇸🇬', name: 'Singapore', dummy: '8123 4567' },
    { code: '+27', flag: '🇿🇦', name: 'South Africa', dummy: '072 123 4567' },
    { code: '+41', flag: '🇨🇭', name: 'Switzerland', dummy: '79 123 45 67' },
    { code: '+46', flag: '🇸🇪', name: 'Sweden', dummy: '070 123 45 67' },
    { code: '+47', flag: '🇳🇴', name: 'Norway', dummy: '912 34 567' },
    { code: '+45', flag: '🇩🇰', name: 'Denmark', dummy: '12 34 56 78' },
    { code: '+358', flag: '🇫🇮', name: 'Finland', dummy: '040 1234567' },
    { code: '+64', flag: '🇳🇿', name: 'New Zealand', dummy: '021 123 4567' },
    { code: '+60', flag: '🇲🇾', name: 'Malaysia', dummy: '012-345 6789' },
    { code: '+66', flag: '🇹🇭', name: 'Thailand', dummy: '081 234 5678' },
    { code: '+84', flag: '🇻🇳', name: 'Vietnam', dummy: '090 123 4567' },
    { code: '+63', flag: '🇵🇭', name: 'Philippines', dummy: '0917 123 4567' },
    { code: '+92', flag: '🇵🇰', name: 'Pakistan', dummy: '300 1234567' },
    { code: '+880', flag: '🇧🇩', name: 'Bangladesh', dummy: '01712 345678' },
    { code: '+20', flag: '🇪🇬', name: 'Egypt', dummy: '010 1234 5678' },
    { code: '+234', flag: '🇳🇬', name: 'Nigeria', dummy: '0803 123 4567' },
    { code: '+254', flag: '🇰🇪', name: 'Kenya', dummy: '0712 345678' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina', dummy: '9 11 1234 5678' },
    { code: '+56', flag: '🇨🇱', name: 'Chile', dummy: '9 1234 5678' },
    { code: '+57', flag: '🇨🇴', name: 'Colombia', dummy: '300 123 4567' },
    { code: '+51', flag: '🇵🇪', name: 'Peru', dummy: '912 345 678' },
  ];

  // Country Select State
  const [isCountrySelectOpen, setIsCountrySelectOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countrySelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countrySelectRef.current && !countrySelectRef.current.contains(event.target as Node)) {
        setIsCountrySelectOpen(false);
      }
    };

    if (isCountrySelectOpen) {
      setCountrySearch(''); // Reset search on open
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCountrySelectOpen]);

  const selectedCountry = countryCodes.find(c => c.code === profileData.countryCode) || countryCodes[0];

  const filteredCountries = countryCodes.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
    c.code.includes(countrySearch)
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-300 text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-background border-r border-slate-700 flex-col h-full shrink-0 z-20">
        <div className="p-6 h-16 flex items-center">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-primary">Auto</span>Social
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === View.DASHBOARD && currentView === View.REPLIES);
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-true-white shadow-lg shadow-indigo-500/25' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto border-t border-slate-700">
           <button 
             onClick={() => setCurrentView(View.LEGAL)}
             className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${currentView === View.LEGAL ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
           >
              <FileText size={16} /> Terms & Privacy
           </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Global Top Header (Desktop & Mobile) */}
        <header className="h-16 flex-none bg-background/80 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0">
            {/* Left Side: Title or Mobile Brand */}
            <div className="flex items-center gap-3">
                <div className="md:hidden font-bold text-lg text-white flex items-center gap-1">
                    <span className="text-primary">Auto</span>Social
                </div>
                <div className="hidden md:block text-lg font-semibold text-slate-200">
                    {formatTitle(currentView)}
                </div>
            </div>

            {/* Right Side: Tools */}
            <div className="flex items-center gap-3 sm:gap-5">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700"
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                   {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className={`p-2 rounded-full transition-all relative border ${isNotificationsOpen ? 'bg-slate-700 text-true-white border-slate-600' : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white border-transparent hover:border-slate-700'}`}
                  >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-2 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 text-[10px] items-center justify-center text-true-white font-bold leading-none border border-background"></span>
                        </span>
                      )}
                  </button>
                  
                  {/* Notifications Popover */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-surface border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 origin-top-right ring-1 ring-black/5">
                       <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
                          <h4 className="text-sm font-semibold text-white">Notifications</h4>
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">{unreadCount} New</span>
                       </div>
                       <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                         {notifications.length > 0 ? (
                           notifications.map((notification) => (
                             <div key={notification.id} className={`p-4 border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}>
                               <div className="flex gap-3">
                                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notification.type === 'warning' ? 'bg-amber-500' : notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                  <div className="flex-1">
                                     <p className={`text-sm leading-snug ${!notification.read ? 'text-white font-medium' : 'text-slate-300'}`}>
                                       {notification.text}
                                     </p>
                                     <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                                       <ActivityIcon size={10} /> {notification.time}
                                     </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" title="Unread"></div>
                                  )}
                               </div>
                             </div>
                           ))
                         ) : (
                           <div className="p-8 text-center text-slate-500 text-sm">
                             No notifications yet.
                           </div>
                         )}
                       </div>
                       <div className="p-2 bg-slate-800/30 border-t border-slate-700">
                          <button className="w-full py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                             Mark all as read
                          </button>
                       </div>
                    </div>
                  )}
                </div>

                {/* Profile Section */}
                <div className="flex items-center gap-3 pl-2 sm:border-l border-slate-700/50 h-8">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white leading-none">{profileData.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{profileData.role}</p>
                    </div>
                    <button 
                      onClick={() => setIsProfileOpen(true)}
                      className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg shadow-indigo-500/20 group cursor-pointer"
                    >
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden relative">
                           <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=0f172a&color=fff`} 
                            alt="Profile" 
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                           />
                        </div>
                    </button>
                </div>
            </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-background scroll-smooth pb-24 md:pb-0 relative custom-scrollbar">
            <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">
              {children}
            </div>
        </main>

        {/* Notification Toast */}
        {toast && (
          <div className={`fixed top-24 right-6 z-[60] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 ${toast.type === 'success' ? 'bg-green-600 text-true-white' : 'bg-red-600 text-true-white'}`}>
             {toast.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
             <div>
                <h4 className="font-bold text-sm">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
                <p className="text-sm opacity-90">{toast.message}</p>
             </div>
          </div>
        )}

        {/* Profile Modal */}
        <Modal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} title="Profile Settings" size="md">
          <div className="space-y-6">
             <div className="flex flex-col items-center justify-center -mt-2 mb-6 pb-6 border-b border-slate-700/50">
                <div className="relative">
                   <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden shadow-xl">
                       <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=0f172a&color=fff`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                       />
                   </div>
                   <button className="absolute bottom-0 right-0 bg-primary p-2 rounded-full text-true-white border-4 border-surface hover:bg-indigo-600 transition-colors shadow-lg">
                      <Camera size={14} />
                   </button>
                </div>
                <h3 className="text-white font-bold text-xl mt-3">{profileData.name}</h3>
                <p className="text-slate-400 text-sm">@{profileData.username}</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="sm:col-span-2">
                   <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                   <div className="relative group">
                      <User className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                      <input 
                        type="text" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                        placeholder="Enter your full name"
                      />
                   </div>
                </div>

                {/* Username */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Username</label>
                   <div className="relative group">
                      <span className="absolute left-3 top-2.5 text-slate-500 font-bold group-focus-within:text-primary transition-colors">@</span>
                      <input 
                        type="text" 
                        value={profileData.username}
                        onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                        placeholder="username"
                      />
                   </div>
                </div>

                {/* Mobile */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Mobile</label>
                   <div className="flex gap-2">
                      {/* Custom Dropdown for Country with Search */}
                      <div className="relative w-28 shrink-0" ref={countrySelectRef}>
                        <button 
                          onClick={() => setIsCountrySelectOpen(!isCountrySelectOpen)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2.5 flex items-center justify-between text-sm text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                        >
                           <span className="flex items-center gap-1.5 truncate">
                             <span>{selectedCountry.flag}</span>
                             <span>{selectedCountry.code}</span>
                           </span>
                           <ChevronDown size={14} className={`text-slate-500 transition-transform ${isCountrySelectOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isCountrySelectOpen && (
                          <div className="absolute top-full left-0 w-64 sm:w-72 mt-2 bg-surface border border-slate-700 rounded-xl shadow-xl max-h-60 overflow-hidden z-50 animate-in fade-in zoom-in-95 origin-top-left flex flex-col">
                             <div className="p-2 border-b border-slate-700 bg-surface sticky top-0 z-10">
                                <div className="relative">
                                   <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"/>
                                   <input 
                                      type="text"
                                      value={countrySearch}
                                      onChange={(e) => setCountrySearch(e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:ring-1 focus:ring-primary outline-none placeholder-slate-500"
                                      placeholder="Search country or code..."
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                   />
                                </div>
                             </div>
                             <div className="overflow-y-auto custom-scrollbar p-1">
                               {filteredCountries.length > 0 ? (
                                 filteredCountries.map((c, i) => (
                                   <button
                                     key={i}
                                     onClick={() => {
                                       setProfileData({...profileData, countryCode: c.code, mobile: c.dummy});
                                       setIsCountrySelectOpen(false);
                                     }}
                                     className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm hover:bg-slate-800 transition-colors ${profileData.countryCode === c.code ? 'bg-slate-800 text-primary' : 'text-slate-300'}`}
                                   >
                                     <span className="text-lg shrink-0">{c.flag}</span>
                                     <span className="font-medium w-10 shrink-0">{c.code}</span>
                                     <span className="truncate text-xs text-slate-500">{c.name}</span>
                                   </button>
                                 ))
                               ) : (
                                  <div className="py-4 text-center text-xs text-slate-500">No countries found</div>
                               )}
                             </div>
                          </div>
                        )}
                      </div>

                      <input 
                        type="tel" 
                        value={profileData.mobile}
                        onChange={(e) => setProfileData({...profileData, mobile: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                        placeholder="Mobile Number"
                      />
                   </div>
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                   <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                   <div className="relative group">
                      <Mail className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                        placeholder="you@example.com"
                      />
                   </div>
                </div>

                {/* Password */}
                <div className="sm:col-span-2">
                   <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
                   <div className="relative group">
                      <Lock className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                      <input 
                        type="password" 
                        value={profileData.password}
                        onChange={(e) => setProfileData({...profileData, password: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder-slate-600"
                        placeholder="••••••••••••"
                      />
                   </div>
                   <p className="text-[10px] text-slate-500 mt-1 ml-1">Leave blank to keep current password</p>
                </div>
             </div>

             <div className="pt-4">
                <button 
                  onClick={handleSaveProfile}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-indigo-600 text-true-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                >
                   <Save size={18} /> Save Profile Changes
                </button>
             </div>
          </div>
        </Modal>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-surface/95 backdrop-blur-xl border-t border-slate-700 z-50 pb-safe shadow-2xl">
        <div className="flex justify-between items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === View.DASHBOARD && currentView === View.REPLIES);
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-colors min-w-[3.5rem] rounded-lg ${
                  isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className={`p-1 rounded-full ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};