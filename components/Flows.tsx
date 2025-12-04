
import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, MessageSquare, Split, PlayCircle, Plus, ZoomIn, ZoomOut, Maximize, 
  Save, Trash2, GripHorizontal, MousePointer2, Move, Hand, X 
} from 'lucide-react';

interface Node {
  id: string;
  type: 'trigger' | 'message' | 'condition' | 'action';
  label: string;
  x: number;
  y: number;
  data?: any;
}

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
}

// Visual configuration for different node types
const NODE_CONFIG = {
  trigger: {
    color: 'border-emerald-500',
    header: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    icon: Zap,
    label: 'Trigger',
    bg: 'bg-emerald-500/5'
  },
  message: {
    color: 'border-blue-500',
    header: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    icon: MessageSquare,
    label: 'Message',
    bg: 'bg-blue-500/5'
  },
  condition: {
    color: 'border-amber-500',
    header: 'bg-gradient-to-r from-amber-500 to-orange-500',
    icon: Split,
    label: 'Condition',
    bg: 'bg-amber-500/5'
  },
  action: {
    color: 'border-pink-500',
    header: 'bg-gradient-to-r from-pink-500 to-rose-500',
    icon: PlayCircle,
    label: 'Action',
    bg: 'bg-pink-500/5'
  }
};

export const Flows: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', type: 'trigger', label: 'Start Flow', x: 100, y: 300 },
    { id: '2', type: 'message', label: 'Welcome Message', x: 400, y: 300 },
  ]);
  
  const [connections, setConnections] = useState<Connection[]>([
    { id: 'c1', sourceId: '1', targetId: '2' }
  ]);

  const [scale, setScale] = useState(1);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [toolMode, setToolMode] = useState<'select' | 'hand'>('select');
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Handle Dragging Logic
  const handleMouseDown = (e: React.MouseEvent, nodeId?: string) => {
    if (toolMode === 'hand' || !nodeId) {
      // Panning Logic
      setIsPanning(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      return;
    }
    
    // Node Dragging Logic
    e.stopPropagation();
    setDraggedNode(nodeId);
    setSelectedNodeId(nodeId);
    
    // Calculate offset from node top-left
    const node = nodes.find(n => n.id === nodeId);
    if (node && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - panOffset.x) / scale;
      const mouseY = (e.clientY - rect.top - panOffset.y) / scale;
      setOffset({
        x: mouseX - node.x,
        y: mouseY - node.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (draggedNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - panOffset.x) / scale;
      const mouseY = (e.clientY - rect.top - panOffset.y) / scale;
      
      setNodes(nodes.map(n => 
        n.id === draggedNode 
          ? { ...n, x: mouseX - offset.x, y: mouseY - offset.y } 
          : n
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsPanning(false);
  };

  const addNode = (type: Node['type']) => {
    // Add in center of view
    const centerX = (-panOffset.x + (canvasRef.current?.clientWidth || 800) / 2) / scale;
    const centerY = (-panOffset.y + (canvasRef.current?.clientHeight || 600) / 2) / scale;

    const newNode: Node = {
      id: Date.now().toString(),
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      x: centerX - 100 + (Math.random() * 50),
      y: centerY - 50 + (Math.random() * 50),
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const deleteSelected = () => {
    if (selectedNodeId) {
      setNodes(nodes.filter(n => n.id !== selectedNodeId));
      setConnections(connections.filter(c => c.sourceId !== selectedNodeId && c.targetId !== selectedNodeId));
      setSelectedNodeId(null);
    }
  };

  // Helper to draw bezier curves
  const getPath = (start: Node, end: Node) => {
    const startX = start.x + 240; // Right side of node (width approx 240)
    const startY = start.y + 40;  // Center height approx
    const endX = end.x;
    const endY = end.y + 40;
    
    // Control points for bezier
    const dist = Math.abs(endX - startX) * 0.5;
    return `M ${startX} ${startY} C ${startX + dist} ${startY}, ${endX - dist} ${endY}, ${endX} ${endY}`;
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col animate-fade-in overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="h-14 bg-surface border-b border-slate-700 flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-2">
           <h2 className="font-bold text-white mr-4">Flow Builder</h2>
           <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
              <button 
                onClick={() => setToolMode('select')}
                className={`p-1.5 rounded transition-colors ${toolMode === 'select' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                title="Select Mode"
              >
                <MousePointer2 size={18} />
              </button>
              <button 
                onClick={() => setToolMode('hand')}
                className={`p-1.5 rounded transition-colors ${toolMode === 'hand' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                title="Pan Mode"
              >
                <Hand size={18} />
              </button>
           </div>
           
           <div className="h-6 w-px bg-slate-700 mx-2"></div>
           
           <div className="flex items-center gap-1">
             <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="p-1.5 hover:bg-slate-800 rounded text-slate-400">
               <ZoomOut size={18} />
             </button>
             <span className="text-xs text-slate-400 w-12 text-center">{Math.round(scale * 100)}%</span>
             <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-1.5 hover:bg-slate-800 rounded text-slate-400">
               <ZoomIn size={18} />
             </button>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           {selectedNodeId && (
              <button 
                onClick={deleteSelected}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                title="Delete Selected"
              >
                <Trash2 size={20} />
              </button>
           )}
           <button className="flex items-center gap-2 bg-primary hover:bg-indigo-600 text-true-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
             <Save size={16} /> Save Flow
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Component Sidebar */}
        <div className="w-16 md:w-64 bg-surface border-r border-slate-700 flex flex-col z-20 shrink-0">
           <div className="p-4 border-b border-slate-700 hidden md:block">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Components</h3>
           </div>
           
           <div className="p-2 space-y-2 overflow-y-auto">
              <p className="text-[10px] text-slate-500 text-center mb-2 md:hidden">Drag</p>
              {(Object.keys(NODE_CONFIG) as Array<keyof typeof NODE_CONFIG>).map(type => {
                 const config = NODE_CONFIG[type];
                 const Icon = config.icon;
                 return (
                   <div 
                      key={type}
                      onClick={() => addNode(type)}
                      className="group flex flex-col md:flex-row items-center gap-3 p-3 rounded-xl border border-slate-700/50 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-all active:scale-95"
                   >
                      <div className={`p-2 rounded-lg ${config.bg} ${config.color.replace('border', 'text')}`}>
                         <Icon size={20} />
                      </div>
                      <div className="hidden md:block">
                         <span className="text-sm font-medium text-white block">{config.label}</span>
                         <span className="text-xs text-slate-500">Drag to canvas</span>
                      </div>
                   </div>
                 )
              })}
           </div>
        </div>

        {/* Canvas Area */}
        <div 
          ref={canvasRef}
          className="flex-1 bg-slate-900 overflow-hidden relative cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => handleMouseDown(e)}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
           {/* Background Grid Pattern */}
           <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                 backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
                 backgroundSize: `${20 * scale}px ${20 * scale}px`,
                 backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
              }}
           ></div>
           
           {/* Transform Container */}
           <div 
              className="absolute origin-top-left will-change-transform"
              style={{
                 transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`
              }}
           >
              {/* Connections Layer */}
              <svg className="absolute top-0 left-0 w-[5000px] h-[5000px] pointer-events-none overflow-visible">
                 <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                    </marker>
                 </defs>
                 {connections.map(conn => {
                    const source = nodes.find(n => n.id === conn.sourceId);
                    const target = nodes.find(n => n.id === conn.targetId);
                    if (!source || !target) return null;
                    return (
                       <path 
                          key={conn.id}
                          d={getPath(source, target)}
                          stroke="#64748b"
                          strokeWidth="2"
                          fill="none"
                          markerEnd="url(#arrowhead)"
                          className="transition-all duration-300"
                       />
                    )
                 })}
              </svg>

              {/* Nodes Layer */}
              {nodes.map(node => {
                 const config = NODE_CONFIG[node.type];
                 const Icon = config.icon;
                 const isSelected = selectedNodeId === node.id;
                 
                 return (
                   <div
                      key={node.id}
                      onMouseDown={(e) => handleMouseDown(e, node.id)}
                      className={`absolute w-60 rounded-xl bg-surface border-2 shadow-xl transition-shadow ${isSelected ? 'ring-2 ring-primary border-transparent' : config.color} hover:shadow-2xl`}
                      style={{
                         transform: `translate(${node.x}px, ${node.y}px)`,
                         cursor: toolMode === 'select' ? 'grab' : 'default'
                      }}
                   >
                      {/* Node Header */}
                      <div className={`h-10 ${config.header} flex items-center px-3 gap-2 rounded-t-lg`}>
                         <Icon size={16} className="text-white drop-shadow-md" />
                         <span className="text-white font-bold text-sm drop-shadow-md">{config.label}</span>
                         <div className="ml-auto flex gap-1">
                            <GripHorizontal size={14} className="text-white/50" />
                         </div>
                      </div>
                      
                      {/* Node Body */}
                      <div className="p-3 bg-surface/95 backdrop-blur rounded-b-lg">
                         <div className="text-sm text-slate-200 font-medium mb-1">{node.label}</div>
                         <p className="text-xs text-slate-500">
                           {node.type === 'trigger' ? 'When a user sends a message...' : 
                            node.type === 'message' ? 'Send "Hello World"...' : 
                            node.type === 'condition' ? 'Check if user is subscribed...' : 'Perform logic...'}
                         </p>
                      </div>

                      {/* Connection Handles (Visual Only for UI Demo) */}
                      {node.type !== 'trigger' && (
                         <div className="absolute top-1/2 -left-3 w-4 h-4 bg-slate-700 border-2 border-white rounded-full cursor-crosshair hover:scale-125 transition-transform"></div>
                      )}
                      {node.type !== 'action' && (
                         <div className="absolute top-1/2 -right-3 w-4 h-4 bg-slate-700 border-2 border-white rounded-full cursor-crosshair hover:scale-125 transition-transform"></div>
                      )}
                   </div>
                 )
              })}
           </div>
        </div>
        
        {/* Floating Controls / Mini Map placeholder */}
        <div className="absolute bottom-6 right-6 bg-surface/90 border border-slate-700 p-2 rounded-lg shadow-lg z-20">
           <button 
             onClick={() => { setPanOffset({x:0, y:0}); setScale(1); }}
             className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
             title="Fit to Screen"
           >
              <Maximize size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};
