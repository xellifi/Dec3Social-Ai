
import React, { useState, useEffect, useRef } from 'react';
import { ConnectedPage } from '../types';
import { ChevronDown } from 'lucide-react';

interface PageSelectorProps {
  pages: ConnectedPage[];
  selectedPageId: string;
  onSelect: (pageId: string) => void;
  className?: string;
}

export const PageSelector: React.FC<PageSelectorProps> = ({ pages, selectedPageId, onSelect, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPage = pages.find(p => p.id === selectedPageId) || pages[0];

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

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 flex items-center justify-between hover:border-slate-600 transition-all focus:ring-2 focus:ring-primary/50 outline-none group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selectedPage ? (
            <>
              <img
                src={selectedPage.avatarUrl}
                alt={selectedPage.name}
                className="w-6 h-6 rounded-full ring-2 ring-slate-800 flex-shrink-0 object-cover"
              />
              <span className="text-white text-sm font-medium truncate">{selectedPage.name}</span>
            </>
          ) : (
             <span className="text-slate-400 text-sm">Select Page</span>
          )}
        </div>
        <ChevronDown size={16} className={`text-slate-500 group-hover:text-slate-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] top-full left-0 w-full mt-2 bg-surface border border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100 origin-top">
          <div className="p-1 space-y-0.5">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => {
                  onSelect(page.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left group ${
                  page.id === selectedPageId ? 'bg-primary/10' : 'hover:bg-slate-800'
                }`}
              >
                <img
                  src={page.avatarUrl}
                  alt={page.name}
                  className={`w-8 h-8 rounded-full ring-2 flex-shrink-0 object-cover ${page.id === selectedPageId ? 'ring-primary' : 'ring-slate-700 group-hover:ring-slate-600'}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                     <p className={`text-sm font-medium truncate ${page.id === selectedPageId ? 'text-primary' : 'text-white'}`}>{page.name}</p>
                     {page.id === selectedPageId && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                  </div>
                  <p className="text-slate-500 text-xs truncate">ID: {page.id}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
