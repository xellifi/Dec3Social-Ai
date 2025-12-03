
import React, { useState, useEffect } from 'react';
import { Post, ConnectedPage } from '../types';
import { RefreshCw, Heart, MessageCircle, TrendingUp, Clock, Image as ImageIcon } from 'lucide-react';

interface ActivityProps {
  pages: ConnectedPage[];
}

export const Activity: React.FC<ActivityProps> = ({ pages }) => {
  const [filter, setFilter] = useState<'latest' | 'popular'>('latest');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock fetch function
  const fetchPosts = () => {
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const newPosts: Post[] = Array.from({ length: 15 }).map((_, i) => {
        const isPopular = Math.random() > 0.7;
        return {
          id: `post-${Date.now()}-${i}`,
          pageId: pages[Math.floor(Math.random() * pages.length)]?.id || 'unknown',
          content: isPopular 
            ? "This is a viral post engaging thousands of users! Check out the engagement metrics on this one. #viral #trending #growth" 
            : "Just a regular update from our daily activities. Keeping the community informed about what is happening.",
          likes: isPopular ? Math.floor(Math.random() * 5000) + 1000 : Math.floor(Math.random() * 200),
          comments: isPopular ? Math.floor(Math.random() * 500) + 50 : Math.floor(Math.random() * 20),
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 100000000)).toISOString(),
          imageUrl: Math.random() > 0.3 ? `https://picsum.photos/seed/${i + Date.now()}/500/300` : undefined,
          isPopular
        };
      });
      
      // Sort based on filter
      const sorted = filter === 'latest' 
        ? newPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        : newPosts.sort((a, b) => b.likes - a.likes);
        
      setPosts(sorted);
      setIsLoading(false);
    }, 800);
  };

  useEffect(() => {
    if (pages.length > 0) fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, pages]);

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
         <h2 className="text-3xl font-bold text-white">Live Activity</h2>
         <div className="flex gap-2 w-full sm:w-auto">
            <div className="flex bg-slate-900/50 border border-slate-700 rounded-lg p-1 flex-1 sm:flex-none">
                <button 
                  onClick={() => setFilter('latest')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'latest' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <Clock size={14} /> Latest
                </button>
                <button 
                  onClick={() => setFilter('popular')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'popular' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <TrendingUp size={14} /> Popular
                </button>
            </div>
            <button 
                onClick={fetchPosts}
                className={`p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all ${isLoading ? 'animate-spin' : ''}`}
            >
            <RefreshCw size={20} />
            </button>
         </div>
       </div>

       <div className="bg-surface border border-slate-700 rounded-2xl flex flex-col overflow-hidden flex-1 min-h-0">
           <div className="p-4 border-b border-slate-700 bg-slate-800/30">
              <h3 className="text-lg font-semibold text-white">Feed</h3>
           </div>

           {/* Posts List */}
           <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
             {posts.map((post) => {
               const page = pages.find(p => p.id === post.pageId);
               return (
                 <div key={post.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors group">
                    <div className="flex gap-4">
                       {/* Thumbnail */}
                       <div className="w-16 h-16 shrink-0 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                          {post.imageUrl ? (
                            <img src={post.imageUrl} alt="Post media" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={24} className="text-slate-600"/>
                          )}
                       </div>
                       
                       {/* Content */}
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                             <div className="flex items-center gap-2 min-w-0">
                                <img 
                                  src={page?.avatarUrl || "https://via.placeholder.com/20"} 
                                  alt="Page" 
                                  className="w-5 h-5 rounded-full border border-slate-600 shrink-0"
                                />
                                <p className="text-white text-sm font-medium truncate pr-2">{page?.name || "Unknown Page"}</p>
                             </div>
                             <span className="text-slate-500 text-[10px] shrink-0 pt-0.5">
                               {new Date(post.timestamp).toLocaleDateString()}
                             </span>
                          </div>
                          
                          <p className="text-slate-400 text-xs line-clamp-2 mb-2">{post.content}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                             <span className={`flex items-center gap-1 ${post.isPopular ? 'text-red-400 font-medium' : ''}`}>
                               <Heart size={12} className={post.isPopular ? "fill-current" : ""} /> {post.likes.toLocaleString()}
                             </span>
                             <span className="flex items-center gap-1">
                               <MessageCircle size={12} /> {post.comments.toLocaleString()}
                             </span>
                             {post.isPopular && (
                               <span className="hidden sm:flex items-center gap-1 text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-[10px]">
                                 <TrendingUp size={10} /> Viral
                               </span>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
               );
             })}
             
             {posts.length === 0 && !isLoading && (
               <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20">
                  <RefreshCw size={32} className="mb-3 opacity-20"/>
                  <p>No activity found. Refresh to load.</p>
               </div>
             )}

             {isLoading && posts.length === 0 && (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
             )}
           </div>
       </div>
    </div>
  );
};
