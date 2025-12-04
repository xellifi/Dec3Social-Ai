
import React, { useState, useEffect } from 'react';
import { ConnectedPage, ScheduledPost } from '../types';
import { Facebook, Bot, BrainCircuit, Trash2, MessageSquareText, Book, Instagram, CheckCircle, Unplug, User, AlertTriangle, Layers, Clock, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { Modal } from './Modal';

// Curve calculation helpers
const line = (pointA: number[], pointB: number[]) => {
  const lengthX = pointB[0] - pointA[0];
  const lengthY = pointB[1] - pointA[1];
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  };
};

const controlPoint = (current: number[], previous: number[], next: number[], reverse?: boolean) => {
  const p = previous || current;
  const n = next || current;
  const o = line(p, n);
  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * 0.2;
  const x = current[0] + Math.cos(angle) * length;
  const y = current[1] + Math.sin(angle) * length;
  return [x, y];
};

const bezierCommand = (point: number[], i: number, a: number[][]) => {
  const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
  const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
  return `C ${cpsX.toFixed(2)},${cpsY.toFixed(2)} ${cpeX.toFixed(2)},${cpeY.toFixed(2)} ${point[0].toFixed(2)},${point[1].toFixed(2)}`;
};

const getSvgPath = (points: number[][]) => {
  return points.reduce((acc, point, i, a) => 
    i === 0 
      ? `M ${point[0].toFixed(2)},${point[1].toFixed(2)}` 
      : `${acc} ${bezierCommand(point, i, a)}`
  , '');
};

interface DashboardProps {
  pages: ConnectedPage[];
  setPages: React.Dispatch<React.SetStateAction<ConnectedPage[]>>;
  scheduledPosts: ScheduledPost[];
  onNavigateToReplies: (pageId: string) => void;
  onNavigateToGuide: () => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

const timeRanges = [
  { id: '7d', label: '7Days' },
  { id: '1m', label: '1Mo' },
  { id: '3m', label: '3Mo' },
  { id: '6m', label: '6Mo' },
  { id: '1y', label: '1Yr' },
  { id: 'all', label: 'All' },
];

export const Dashboard: React.FC<DashboardProps> = ({ pages, setPages, scheduledPosts, onNavigateToReplies, onNavigateToGuide }) => {
  const [isTrainModalOpen, setIsTrainModalOpen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  // Facebook Main Profile State
  const [isProfileVisible, setIsProfileVisible] = useState(true);
  const [isProfileConnected, setIsProfileConnected] = useState(true);

  // Confirmation Modals State
  const [isProfileDeleteModalOpen, setIsProfileDeleteModalOpen] = useState(false); // For permanent deletion
  const [isProfileToggleModalOpen, setIsProfileToggleModalOpen] = useState(false); // For switching off
  const [isDeletePageModalOpen, setIsDeletePageModalOpen] = useState(false);
  
  // Automation Stop Modal
  const [isStopAutomationModalOpen, setIsStopAutomationModalOpen] = useState(false);
  const [pageToStopId, setPageToStopId] = useState<string | null>(null);
  
  // Warning/Blocking Modal State
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const [pageToDeleteId, setPageToDeleteId] = useState<string | null>(null);

  // Form States
  const [trainingText, setTrainingText] = useState('');

  // Graph State
  const [timeRange, setTimeRange] = useState('7d');

  // Notification State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'warning' | 'error'} | null>(null);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleConnectFacebook = () => {
    // 1. Retrieve App ID from Settings (LocalStorage)
    const storedSettings = localStorage.getItem('app_settings');
    let appId = '';
    
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        appId = parsed.fbAppId;
      } catch (e) {
        console.error("Error reading settings", e);
      }
    }

    if (!appId) {
      setWarningMessage("Missing Facebook App ID! Please go to Settings and configure your App Credentials first.");
      setIsWarningModalOpen(true);
      return;
    }

    // 2. Construct OAuth URL
    // Scopes required for page management
    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_manage_metadata',
      'pages_messaging'
    ].join(',');

    const redirectUri = window.location.href.split('?')[0]; // Redirect back to current page
    const state = `fb_connect_${Date.now()}`; // Simple state param

    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${state}&response_type=token`;

    // 3. Redirect User
    window.location.href = authUrl;
  };

  const handleToggleAutomation = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) {
        if (page.automationEnabled) {
            // Currently ON, user wants to turn OFF -> Show Confirmation Modal
            setPageToStopId(id);
            setIsStopAutomationModalOpen(true);
        } else {
            // NEW CHECK: Prevent turning on if main profile is disconnected
            if (!isProfileConnected) {
               setWarningMessage("You must connect the main Profile before enabling automation for this page.");
               setIsWarningModalOpen(true);
               return;
            }

            // Currently OFF, turning ON -> Do it immediately
            setPages(pages.map(p => p.id === id ? { ...p, automationEnabled: true } : p));
            setNotification({
                message: "Automation activated successfully!",
                type: 'success'
            });
        }
    }
  };

  const confirmStopAutomation = () => {
    if (pageToStopId) {
        setPages(pages.map(p => p.id === pageToStopId ? { ...p, automationEnabled: false } : p));
        setPageToStopId(null);
    }
    setIsStopAutomationModalOpen(false);
  };

  const openTrainModal = (page: ConnectedPage) => {
    setSelectedPageId(page.id);
    setTrainingText(page.aiInstructions);
    setIsTrainModalOpen(true);
  };

  const saveTraining = () => {
    if (selectedPageId) {
      setPages(pages.map(p => p.id === selectedPageId ? { ...p, aiInstructions: trainingText } : p));
    }
    setIsTrainModalOpen(false);
  };
  
  // --- Profile Logic ---
  const getActivePageCount = () => pages.filter(p => p.automationEnabled).length;

  // 1. Toggle Switch Logic
  const handleProfileToggle = () => {
    if (isProfileConnected) {
      // Turning OFF
      const activeCount = getActivePageCount();
      
      if (activeCount > 0) {
        const noun = activeCount === 1 ? 'page' : 'pages';
        setWarningMessage(`Opps! Not allowed! You have ${activeCount} ${noun} with active connection, turn them off first.`);
        setIsWarningModalOpen(true);
        return;
      }

      // Ask Confirmation
      setIsProfileToggleModalOpen(true);
    } else {
      // Turning ON -> Direct
      setIsProfileConnected(true);
    }
  };

  const confirmProfileTurnOff = () => {
    setIsProfileConnected(false);
    setIsProfileToggleModalOpen(false);
  };

  // 2. Trash Icon Logic (Delete)
  const handleProfileDeleteRequest = () => {
    const activeCount = getActivePageCount();

    // Block deletion if active pages exist (Check 1)
    if (activeCount > 0) {
      const noun = activeCount === 1 ? 'page' : 'pages';
      setWarningMessage(`Opps! Not allowed! You have ${activeCount} ${noun} with active connection, turn them off first.`);
      setIsWarningModalOpen(true);
      return;
    }

    if (isProfileConnected) {
      // Block deletion if profile is still connected (Check 2)
      setWarningMessage("You can't delete an active profile! Disconnect it first");
      setIsWarningModalOpen(true);
    } else {
      // Allow deletion if inactive and no active pages
      setIsProfileDeleteModalOpen(true);
    }
  };

  const confirmDeleteProfile = () => {
    setIsProfileVisible(false); // "Delete" the profile card
    setPages([]); // Delete all connected pages (Ensures "No pages connected" sad emoji state)
    setIsProfileDeleteModalOpen(false);
  };

  // --- Page Logic ---

  // Delete Page Logic
  const requestDeletePage = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (!page) return;

    // Block deletion if automation is active
    if (page.automationEnabled) {
      setWarningMessage("Opps! Not allowed! You have an active connection on this page, turn it off first.");
      setIsWarningModalOpen(true);
      return;
    }

    // Allow deletion if inactive, show confirmation
    setPageToDeleteId(id);
    setIsDeletePageModalOpen(true);
  };

  const confirmDeletePage = () => {
    if (pageToDeleteId) {
      setPages(pages.filter(p => p.id !== pageToDeleteId));
      setPageToDeleteId(null);
    }
    setIsDeletePageModalOpen(false);
  };

  // --- Chart Data ---
  const getChartData = (range: string) => {
    switch(range) {
      case '1m':
        return [
          { label: 'Week 1', incoming: 120, sent: 98 },
          { label: 'Week 2', incoming: 145, sent: 115 },
          { label: 'Week 3', incoming: 132, sent: 108 },
          { label: 'Week 4', incoming: 165, sent: 140 },
        ];
      case '3m':
        // 12 Weeks Logic
        return [
          { label: 'W1', incoming: 220, sent: 180 },
          { label: 'W2', incoming: 260, sent: 210 },
          { label: 'W3', incoming: 240, sent: 200 },
          { label: 'W4', incoming: 290, sent: 240 },
          { label: 'W5', incoming: 310, sent: 270 },
          { label: 'W6', incoming: 350, sent: 300 },
          { label: 'W7', incoming: 330, sent: 290 },
          { label: 'W8', incoming: 380, sent: 340 },
          { label: 'W9', incoming: 410, sent: 360 },
          { label: 'W10', incoming: 440, sent: 390 },
          { label: 'W11', incoming: 480, sent: 420 },
          { label: 'W12', incoming: 520, sent: 460 },
        ];
      case '6m':
        return [
          { label: 'Jul', incoming: 380, sent: 320 },
          { label: 'Aug', incoming: 410, sent: 350 },
          { label: 'Sep', incoming: 390, sent: 340 },
          { label: 'Oct', incoming: 450, sent: 380 },
          { label: 'Nov', incoming: 520, sent: 460 },
          { label: 'Dec', incoming: 610, sent: 550 },
        ];
      case '1y':
        return [
          { label: 'Jan', incoming: 320, sent: 280 },
          { label: 'Feb', incoming: 350, sent: 310 },
          { label: 'Mar', incoming: 400, sent: 360 },
          { label: 'Apr', incoming: 380, sent: 340 },
          { label: 'May', incoming: 420, sent: 390 },
          { label: 'Jun', incoming: 450, sent: 410 },
          { label: 'Jul', incoming: 480, sent: 440 },
          { label: 'Aug', incoming: 460, sent: 420 },
          { label: 'Sep', incoming: 510, sent: 470 },
          { label: 'Oct', incoming: 540, sent: 500 },
          { label: 'Nov', incoming: 580, sent: 540 },
          { label: 'Dec', incoming: 620, sent: 590 },
        ];
      case 'all':
        return [
          { label: '2020', incoming: 1200, sent: 900 },
          { label: '2021', incoming: 2500, sent: 2100 },
          { label: '2022', incoming: 3800, sent: 3400 },
          { label: '2023', incoming: 5200, sent: 4800 },
        ];
      case '7d':
      default:
        return [
          { label: 'Mon', incoming: 24, sent: 18 },
          { label: 'Tue', incoming: 45, sent: 38 },
          { label: 'Wed', incoming: 32, sent: 28 },
          { label: 'Thu', incoming: 65, sent: 55 },
          { label: 'Fri', incoming: 48, sent: 42 },
          { label: 'Sat', incoming: 78, sent: 65 },
          { label: 'Sun', incoming: 52, sent: 45 },
        ];
    }
  };

  // --- Posts Stats Data (Bar Chart) ---
  const getPostStatsData = (range: string) => {
    // Generate mock data consistent with the time range logic
    switch(range) {
      case '1m':
        return [
          { label: 'Week 1', published: 12, queued: 5 },
          { label: 'Week 2', published: 8, queued: 8 },
          { label: 'Week 3', published: 15, queued: 4 },
          { label: 'Week 4', published: 10, queued: 6 },
        ];
      case '3m':
        // Mocking 12 weeks
        return Array.from({length: 12}, (_, i) => ({
          label: `W${i+1}`,
          published: Math.floor(Math.random() * 20) + 5,
          queued: Math.floor(Math.random() * 10) + 2
        }));
      case '6m':
        return ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => ({
          label: m,
          published: Math.floor(Math.random() * 50) + 20,
          queued: Math.floor(Math.random() * 30) + 10
        }));
      case '1y':
         return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => ({
          label: m,
          published: Math.floor(Math.random() * 40) + 15,
          queued: Math.floor(Math.random() * 20) + 5
        }));
      case 'all':
        return ['2020', '2021', '2022', '2023'].map(y => ({
          label: y,
          published: Math.floor(Math.random() * 200) + 100,
          queued: Math.floor(Math.random() * 100) + 20
        }));
      case '7d':
      default:
        return [
          { label: 'Mon', published: 4, queued: 2 },
          { label: 'Tue', published: 3, queued: 5 },
          { label: 'Wed', published: 5, queued: 1 },
          { label: 'Thu', published: 2, queued: 6 },
          { label: 'Fri', published: 6, queued: 3 },
          { label: 'Sat', published: 8, queued: 4 },
          { label: 'Sun', published: 5, queued: 0 },
        ];
    }
  };

  const chartData = getChartData(timeRange);
  const postStatsData = getPostStatsData(timeRange);

  const totalIncoming = chartData.reduce((acc, curr) => acc + curr.incoming, 0);
  const totalSent = chartData.reduce((acc, curr) => acc + curr.sent, 0);
  const totalPublished = postStatsData.reduce((acc, curr) => acc + curr.published, 0);
  const totalQueued = postStatsData.reduce((acc, curr) => acc + curr.queued, 0);

  // Normalization for the chart SVG (0-100 scale)
  const maxDataValue = Math.max(...chartData.flatMap(d => [d.incoming, d.sent]));
  const maxVal = maxDataValue > 0 ? maxDataValue * 1.1 : 100; // Add 10% padding
  
  const incomingDataPoints = chartData.map((d, i) => {
     const x = (i / (chartData.length - 1)) * 100;
     const y = 100 - ((d.incoming / maxVal) * 80);
     return [x, y];
  });

  const sentDataPoints = chartData.map((d, i) => {
     const x = (i / (chartData.length - 1)) * 100;
     const y = 100 - ((d.sent / maxVal) * 80);
     return [x, y];
  });

  const pathIncoming = getSvgPath(incomingDataPoints);
  const pathSent = getSvgPath(sentDataPoints);

  // Bar Chart Helpers
  const maxPostValue = Math.max(...postStatsData.flatMap(d => [d.published, d.queued])) * 1.2 || 10;
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-6 z-50 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 ${
            notification.type === 'success' ? 'bg-green-600' : 
            notification.type === 'warning' ? 'bg-amber-600' : 
            'bg-red-600'
        } text-true-white`}>
           {notification.type === 'success' && <CheckCircle size={24} />}
           {notification.type === 'warning' && <AlertTriangle size={24} />}
           {notification.type === 'error' && <AlertCircle size={24} />}
           <div>
              <h4 className="font-bold text-sm capitalize">{notification.type}</h4>
              <p className="text-sm opacity-90">{notification.message}</p>
           </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Overview</h2>
          <p className="text-slate-400 text-sm sm:text-base mt-1">Manage your Facebook ecosystem.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleConnectFacebook}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-indigo-600 text-true-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap"
          >
            <Facebook size={20} /> <span className="hidden sm:inline">Connect with Facebook</span><span className="sm:hidden">Connect</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-slate-700 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 shrink-0 border border-blue-500/20">
            <Facebook size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Connected Pages</p>
            <p className="text-2xl font-bold text-white mt-0.5">{pages.length}</p>
          </div>
        </div>
        <div className="bg-surface border border-slate-700 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-green-500/20 rounded-xl text-green-600 dark:text-green-400 shrink-0 border border-green-500/20">
            <Bot size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Active Bots</p>
            <p className="text-2xl font-bold text-white mt-0.5">{pages.filter(p => p.automationEnabled).length}</p>
          </div>
        </div>
        <div className="bg-surface border border-slate-700 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 shrink-0 border border-amber-500/20">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Queued Posts</p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {scheduledPosts.filter(p => p.status === 'queued').length.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-surface border border-slate-700 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400 shrink-0 border border-purple-500/20">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Published Posts</p>
            <p className="text-2xl font-bold text-white mt-0.5">
               {scheduledPosts.filter(p => p.status === 'published').length.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Message Activity Graph */}
      <div className="bg-surface border border-slate-700 p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        {/* Modern decorative element */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col gap-6 mb-6 relative z-10">
           {/* Top Row: Title */}
           <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <TrendingUp size={24} className="text-indigo-600 dark:text-indigo-400" /> Performance Overview
              </h3>
              <p className="text-slate-400 text-sm mt-1 font-medium">Message traffic analysis</p>
           </div>

           {/* Controls Row */}
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Range Selector */}
              <div className="flex w-full md:w-auto bg-slate-900/50 p-1 rounded-lg border border-slate-700/50 overflow-x-auto max-w-full custom-scrollbar no-scrollbar-mobile">
                {timeRanges.map(range => (
                   <button 
                     key={range.id}
                     onClick={() => setTimeRange(range.id)}
                     className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${timeRange === range.id ? 'bg-slate-700 text-true-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                   >
                     {range.label}
                   </button>
                ))}
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-6 text-xs sm:text-sm font-medium">
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.4)]"></span>
                    <span className="text-slate-300">Received <span className="text-white font-bold ml-1">{totalIncoming.toLocaleString()}</span></span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#fb923c] shadow-[0_0_8px_rgba(251,146,60,0.4)]"></span>
                    <span className="text-slate-300">Sent <span className="text-white font-bold ml-1">{totalSent.toLocaleString()}</span></span>
                 </div>
              </div>
           </div>
        </div>
        
        {/* Graph Container */}
        <div className="bg-slate-900/30 rounded-2xl border border-slate-700/50 p-4 w-full h-64 relative z-10">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gradientIncoming" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gradientSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb923c" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines - Dashed */}
              {[0, 25, 50, 75, 100].map((y) => (
                 <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" className="opacity-30" />
              ))}

              {/* Incoming Area (Light Green) */}
              <path 
                 d={`${pathIncoming} L 100,100 L 0,100 Z`} 
                 fill="url(#gradientIncoming)" 
              />
              {/* Incoming Line (Light Green) */}
              <path 
                 d={pathIncoming}
                 fill="none" 
                 stroke="#4ade80" 
                 strokeWidth="3" 
                 strokeLinecap="round" 
                 strokeLinejoin="round"
                 vectorEffect="non-scaling-stroke"
              />

              {/* Sent Area (Light Orange) */}
              <path 
                 d={`${pathSent} L 100,100 L 0,100 Z`}
                 fill="url(#gradientSent)" 
              />
              {/* Sent Line (Light Orange) */}
              <path 
                 d={pathSent}
                 fill="none" 
                 stroke="#fb923c" 
                 strokeWidth="3" 
                 strokeLinecap="round" 
                 strokeLinejoin="round"
                 vectorEffect="non-scaling-stroke"
              />
           </svg>
        </div>
        
        {/* X Axis Labels - Moved outside graph container to prevent clipping */}
        <div className="flex justify-between mt-2 px-2 relative z-10 w-full">
          {chartData.map((d, i) => (
            <div key={i} className="flex flex-col items-center justify-center flex-1 min-w-0">
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium whitespace-nowrap">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content Strategy - Published vs Queued Bar Chart */}
      <div className="bg-surface border border-slate-700 p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
         <div className="flex flex-col gap-6 mb-6 relative z-10">
           {/* Top Row: Title */}
           <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Layers size={24} className="text-purple-500" /> Content Strategy
                </h3>
                <p className="text-slate-400 text-sm mt-1 font-medium">Published vs Queued posts</p>
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-6 text-xs sm:text-sm font-medium">
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-purple-500"></span>
                    <span className="text-slate-300">Published <span className="text-white font-bold ml-1">{totalPublished}</span></span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
                    <span className="text-slate-300">Queued <span className="text-white font-bold ml-1">{totalQueued}</span></span>
                 </div>
              </div>
           </div>
         </div>

         {/* Bar Chart Container */}
         <div className="bg-slate-900/30 rounded-2xl border border-slate-700/50 p-6 w-full h-64 relative z-10">
            <div className="w-full h-full flex items-end justify-between gap-2">
              {postStatsData.map((data, index) => {
                const pubHeight = (data.published / maxPostValue) * 100;
                const queueHeight = (data.queued / maxPostValue) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group min-w-0">
                     <div className="w-full max-w-[40px] flex gap-1 items-end h-full">
                        {/* Published Bar */}
                        <div 
                           className="flex-1 bg-purple-500 rounded-t-sm hover:bg-purple-400 transition-all relative group/bar"
                           style={{ height: `${Math.max(pubHeight, 2)}%` }}
                        >
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 whitespace-nowrap z-20 pointer-events-none transition-opacity">
                              {data.published}
                           </div>
                        </div>
                        
                        {/* Queued Bar */}
                        <div 
                           className="flex-1 bg-amber-500 rounded-t-sm hover:bg-amber-400 transition-all relative group/bar"
                           style={{ height: `${Math.max(queueHeight, 2)}%` }}
                        >
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 whitespace-nowrap z-20 pointer-events-none transition-opacity">
                              {data.queued}
                           </div>
                        </div>
                     </div>
                     <span className="text-[10px] sm:text-xs text-slate-400 font-medium truncate w-full text-center">{data.label}</span>
                  </div>
                );
              })}
            </div>
         </div>
      </div>

      {/* Main Facebook Profile Connection */}
      {isProfileVisible ? (
        <div className="bg-surface border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
           {/* Header */}
           <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-slate-700/50 bg-slate-800/20 flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                 Connected Profile
              </h3>
              <button 
                 onClick={handleProfileDeleteRequest}
                 className="text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                 title="Delete Profile"
              >
                  <Trash2 size={18} />
              </button>
           </div>

           {/* Profile Content - Responsive */}
           <div className="p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
               <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6">
                  {/* Avatar */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-700 shrink-0 relative shadow-md overflow-hidden">
                      <img 
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200" 
                          alt="Anne Marie" 
                          className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 border-4 border-surface shadow-sm">
                          <Facebook size={14} style={{ color: 'white' }} />
                      </div>
                  </div>
                  
                  {/* Profile Info */}
                  <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white">Anne Marie</h3>
                      <p className="text-slate-400 mt-1 text-sm sm:text-base">Manage permissions and ad accounts</p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                          {isProfileConnected ? (
                              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 text-sm sm:text-base font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/50">
                                  <CheckCircle size={14} /> Connected!
                              </span>
                          ) : (
                              <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm sm:text-base font-semibold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/50">
                                  <Unplug size={14} /> Disconnected
                              </span>
                          )}
                      </div>
                  </div>
               </div>
               
               {/* Toggle Switch */}
               <button 
                 onClick={handleProfileToggle}
                 className={`w-16 h-9 rounded-full relative transition-all duration-300 focus:outline-none border shrink-0 ${
                     isProfileConnected 
                     ? 'bg-emerald-500 border-emerald-500' 
                     : 'bg-gray-300 dark:bg-slate-700 border-gray-300 dark:border-slate-600'
                 }`}
                 title={isProfileConnected ? "Turn Off" : "Turn On"}
               >
                  <span className={`absolute top-1 left-1 bg-true-white w-6 h-6 rounded-full shadow-sm transition-transform duration-300 ${isProfileConnected ? 'translate-x-7' : 'translate-x-0'}`}></span>
               </button>
           </div>
        </div>
      ) : (
         <div className="bg-surface border border-slate-700 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-500 mb-4">
               <User size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Account Connected 😢</h3>
            <p className="text-slate-400 text-sm max-w-md mb-6">
              Please connect your account to manage pages and automations.
            </p>
            <button 
              onClick={handleConnectFacebook}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-indigo-600 text-true-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
            >
              <Facebook size={20} /> Connect Facebook Account
            </button>
         </div>
      )}

      {/* Pages List */}
      <div className="bg-surface border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold text-white">Connected Pages</h3>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full border border-slate-700">{pages.length}</span>
        </div>
        <div className="divide-y divide-slate-700">
          {pages.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-600 mb-2">
                    <Layers size={32} />
                </div>
                <h4 className="text-slate-300 font-medium text-lg">No pages connected 😢</h4>
                <p className="text-slate-500 text-sm max-w-xs">
                Connect a Facebook profile to import and manage your pages here.
                </p>
            </div>
          ) : (
            pages.map((page) => (
              <div key={page.id} className="relative p-4 sm:p-6 hover:bg-slate-800/30 transition-colors group">
                {/* Delete Button - Desktop */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    requestDeletePage(page.id);
                  }}
                  className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all hidden sm:block opacity-0 group-hover:opacity-100 z-10"
                  title="Delete Page"
                >
                  <Trash2 size={18} /> 
                </button>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  
                  {/* Left Side: Avatars & Info */}
                  <div className="flex items-center justify-between w-full lg:w-auto">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Avatar Stack */}
                      <div className="relative flex items-center">
                          <div className="relative z-20">
                              <img 
                                  src={page.avatarUrl} 
                                  alt={page.name} 
                                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full ring-2 ring-slate-700 object-cover bg-slate-800" 
                              />
                              <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5 border-2 border-surface flex items-center justify-center shadow-sm">
                                  <Facebook size={10} style={{ color: 'white' }} className="fill-current" />
                              </div>
                              {page.automationEnabled && (
                                  <div className="absolute -top-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-slate-800 flex items-center justify-center shadow-sm z-30" title="Auto-Reply Active">
                                     <Bot size={8} className="text-[#ffffff]"/>
                                  </div>
                              )}
                          </div>

                          {page.connectedInstagram && (
                              <div className="relative z-10 -ml-4">
                                  <img 
                                      src={page.instagramAvatarUrl || `https://ui-avatars.com/api/?name=${page.connectedInstagram}&background=random`} 
                                      alt={page.connectedInstagram} 
                                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full ring-2 ring-slate-700 object-cover bg-slate-800" 
                                  />
                                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-0.5 border-2 border-surface flex items-center justify-center shadow-sm">
                                      <Instagram size={10} style={{ color: 'white' }} />
                                  </div>
                              </div>
                          )}
                      </div>

                      <div className="min-w-0">
                         <div className="flex flex-col">
                            <h4 className="font-semibold text-white text-base sm:text-lg leading-tight truncate max-w-[150px] sm:max-w-xs">{page.name}</h4>
                            {page.connectedInstagram && (
                                <span className="text-xs sm:text-sm text-slate-400 mt-0.5 truncate">
                                    & @{page.connectedInstagram}
                                </span>
                            )}
                         </div>
                         {!page.connectedInstagram && <p className="text-[10px] text-slate-500 font-mono mt-1 opacity-60">ID: {page.id}</p>}
                      </div>
                    </div>

                    {/* Mobile Delete Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDeletePage(page.id);
                      }}
                      className="sm:hidden p-2 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 size={18} /> 
                    </button>
                  </div>
                  
                  {/* Right Side: Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                    
                    {/* Automation Switch */}
                    <button 
                      className={`flex items-center justify-between sm:justify-center gap-3 px-4 py-2.5 sm:py-2 rounded-xl border transition-all w-full sm:w-auto ${page.automationEnabled ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-900 border-slate-700 hover:border-slate-600'}`}
                      onClick={() => handleToggleAutomation(page.id)}
                    >
                      <span className={`text-sm font-medium ${page.automationEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {page.automationEnabled ? 'Auto Mode ON' : 'Auto Mode OFF'}
                      </span>
                      <div className={`w-9 h-5 rounded-full relative transition-colors border ${page.automationEnabled ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-300 dark:bg-slate-700 border-gray-300 dark:border-slate-600'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-true-white rounded-full transition-transform ${page.automationEnabled ? 'translate-x-4' : 'translate-x-0'}`}></span>
                      </div>
                    </button>

                    {/* Divider for Mobile */}
                    <div className="h-px bg-slate-700 w-full sm:hidden my-1"></div>

                    {/* Action Buttons Group */}
                    <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onNavigateToReplies(page.id)}
                        className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/50 px-2 py-2 sm:px-3 rounded-lg transition-colors"
                      >
                        <MessageSquareText size={16} /> 
                        <span>Replies</span>
                      </button>

                      <button 
                        onClick={() => openTrainModal(page)}
                        className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/50 px-2 py-2 sm:px-3 rounded-lg transition-colors"
                      >
                        <BrainCircuit size={16} /> 
                        <span>Train</span>
                      </button>

                      <button
                        onClick={onNavigateToGuide}
                        className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/50 px-2 py-2 sm:px-3 rounded-lg transition-colors"
                        title="View Guide"
                      >
                        <Book size={16} /> 
                        <span>Guide</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
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

      {/* Profile Toggle Modal */}
      <Modal isOpen={isProfileToggleModalOpen} onClose={() => setIsProfileToggleModalOpen(false)} title="Disconnect Profile?" size="sm">
        <div className="p-2">
          <p className="text-slate-300 mb-6">Are you sure you want to disconnect this profile? Automation will pause for all associated pages.</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsProfileToggleModalOpen(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-true-white py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={confirmProfileTurnOff}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-true-white py-2 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </Modal>

      {/* Profile Delete Modal */}
      <Modal isOpen={isProfileDeleteModalOpen} onClose={() => setIsProfileDeleteModalOpen(false)} title="Delete Profile?" size="sm">
        <div className="p-2">
          <p className="text-slate-300 mb-6">Are you sure you want to remove this profile? All connected pages will be removed. This cannot be undone.</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsProfileDeleteModalOpen(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-true-white py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={confirmDeleteProfile}
              className="flex-1 bg-red-600 hover:bg-red-700 text-true-white py-2 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Page Delete Modal */}
      <Modal isOpen={isDeletePageModalOpen} onClose={() => setIsDeletePageModalOpen(false)} title="Remove Page?" size="sm">
        <div className="p-2">
          <p className="text-slate-300 mb-6">Are you sure you want to remove this page from your dashboard?</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsDeletePageModalOpen(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-true-white py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={confirmDeletePage}
              className="flex-1 bg-red-600 hover:bg-red-700 text-true-white py-2 rounded-lg transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </Modal>

      {/* Stop Automation Confirmation Modal - NEW */}
      <Modal isOpen={isStopAutomationModalOpen} onClose={() => setIsStopAutomationModalOpen(false)} title="Stop Automation?" size="sm">
        <div className="p-4 text-center">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-4">
             <AlertTriangle size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Warning</h3>
          <p className="text-slate-300 mb-6">All automations setup on this page will stop!</p>
          <div className="flex gap-3">
             <button 
               onClick={() => setIsStopAutomationModalOpen(false)}
               className="flex-1 bg-slate-800 hover:bg-slate-700 text-true-white py-2.5 rounded-lg transition-colors"
             >
               Cancel
             </button>
             <button 
               onClick={confirmStopAutomation}
               className="flex-1 bg-amber-600 hover:bg-amber-700 text-true-white py-2.5 rounded-lg transition-colors font-medium"
             >
               Turn Off
             </button>
          </div>
        </div>
      </Modal>

      {/* Warning Modal */}
      <Modal isOpen={isWarningModalOpen} onClose={() => setIsWarningModalOpen(false)} title="System Notice" size="sm">
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mb-3">
            <AlertTriangle size={24} />
          </div>
          <p className="text-slate-300 mb-6">{warningMessage}</p>
          <button 
            onClick={() => setIsWarningModalOpen(false)}
            className="bg-slate-700 hover:bg-slate-600 text-true-white px-6 py-2 rounded-lg transition-colors w-full"
          >
            Understood
          </button>
        </div>
      </Modal>
    </div>
  );
};
