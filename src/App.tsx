/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Target, 
  Info,
  Maximize2,
  Minimize2,
  Share2
} from 'lucide-react';

// Math Utilities
const degToRad = (deg: number) => (deg * Math.PI) / 180;
const radToDeg = (rad: number) => (rad * 180) / Math.PI;

const SIGNIFICANT_ANGLES = [
  0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330
];

const COLORS = {
  bg: '#020617',
  ink: '#ffffff',
  accent: '#6366f1', // indigo-500
  cos: '#22d3ee', // cyan-400
  sin: '#f43f5e', // rose-500
  ref: '#fbbf24', // amber-400
  grid: '#1e293b', // slate-800
  textMuted: '#64748b', // slate-500
  panel: 'rgba(15, 23, 42, 0.5)', // slate-900/50
};

export default function App() {
  const [angleDeg, setAngleDeg] = useState(60);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const angleRad = useMemo(() => degToRad(angleDeg), [angleDeg]);
  const cosValue = useMemo(() => Math.cos(angleRad), [angleRad]);
  const sinValue = useMemo(() => Math.sin(angleRad), [angleRad]);
  
  const refAngle = useMemo(() => {
    const norm = ((angleDeg % 360) + 360) % 360;
    if (norm <= 90) return norm;
    if (norm <= 180) return 180 - norm;
    if (norm <= 270) return norm - 180;
    return 360 - norm;
  }, [angleDeg]);

  // Format values for display
  const f = (val: number) => val.toFixed(3);
  const toRadianStr = (deg: number) => {
    const fraction = deg / 180;
    if (fraction === 0) return "0";
    if (fraction === 1) return "π";
    if (fraction === 2) return "2π";
    const common: Record<string, string> = {
      "0.167": "π/6", "0.250": "π/4", "0.333": "π/3", "0.500": "π/2",
      "0.667": "2π/3", "0.750": "3π/4", "0.833": "5π/6",
      "1.167": "7π/6", "1.250": "5π/4", "1.333": "4π/3", "1.500": "3π/2",
      "1.667": "5π/3", "1.750": "7π/4", "1.833": "11π/6"
    };
    const key = fraction.toFixed(3);
    return common[key] || `${fraction.toFixed(2)}π`;
  };

  const handleInteraction = useCallback((event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX, clientY;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as MouseEvent).clientX;
      clientY = (event as MouseEvent).clientY;
    }

    const dx = clientX - centerX;
    const dy = centerY - clientY; // Flip Y for math coordinates
    
    // atan2(dy, dx) gives angle in radians from positive X axis
    let rad = Math.atan2(dy, dx);
    let deg = radToDeg(rad);
    
    // Normalize to [0, 360)
    if (deg < 0) deg += 360;
    
    setAngleDeg(Math.round(deg * 10) / 10);
  }, []);

  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleInteraction(e);
  };

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    const handleMove = (e: MouseEvent) => {
      if (isDragging) handleInteraction(e);
    };

    window.addEventListener('mouseup', handleUp);
    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('mousemove', handleMove);
    };
  }, [isDragging, handleInteraction]);

  // SVG dynamic points
  const radius = 200;
  const center = 250;
  const targetX = center + radius * cosValue;
  const targetY = center - radius * sinValue; // Subtract for screen Y

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-200 font-sans overflow-hidden">
      
      {/* Left Panel: Controls and Telemetry */}
      <aside className="w-[320px] bg-slate-900/50 border-r border-white/5 flex flex-col shadow-2xl z-10 hidden lg:flex">
        <div className="p-8 border-b border-white/5">
          <h1 className="text-[10px] uppercase tracking-[0.3em] font-black text-indigo-400 mb-1">Kinetic Mathematics</h1>
          <h2 className="text-3xl font-light tracking-tight text-white">Unit Circle <span className="text-indigo-400 font-medium italic">Lab</span></h2>
        </div>

        <div className="flex-1 p-8 space-y-10 overflow-y-auto">
          {/* Angle Readout */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Primary Measure</span>
              <span className="text-xs text-indigo-400 font-mono font-bold">RAD: {toRadianStr(angleDeg)}</span>
            </div>
            
            <div className="flex items-baseline gap-4">
               <div className="text-7xl font-light tracking-tighter text-white tabular-nums drop-shadow-[0_0_15px_rgba(129,140,248,0.3)]">
                {angleDeg.toFixed(0)}<span className="text-3xl text-slate-600">°</span>
              </div>
              <div className="flex-1 pb-2">
                <div className="text-[10px] uppercase text-indigo-400 font-black tracking-widest opacity-80">Radians</div>
                <div className="text-2xl font-mono text-white tracking-tighter">{(angleRad / Math.PI).toFixed(3)}<span className="text-sm opacity-50 ml-0.5">π</span></div>
              </div>
            </div>

            <div className="w-full h-1 bg-slate-800 rounded-full relative">
              <motion.div 
                className="absolute left-0 top-0 h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"
                style={{ width: `${(angleDeg / 360) * 100}%` }}
              />
            </div>
          </div>

          {/* Reference Angle Badge */}
          <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 flex justify-between items-center group hover:bg-amber-500/15 transition-all cursor-default shadow-[0_0_15px_rgba(251,191,36,0.05)]">
            <div>
              <p className="text-[10px] uppercase text-amber-500 font-black tracking-[0.2em] mb-0.5">Reference Angle α</p>
              <p className="text-xs text-slate-400 italic">
                {(() => {
                  const n = ((angleDeg % 360) + 360) % 360;
                  if (n <= 90) return 'Direct Measure';
                  if (n <= 180) return `180° - ${n.toFixed(0)}°`;
                  if (n <= 270) return `${n.toFixed(0)}° - 180°`;
                  return `360° - ${n.toFixed(0)}°`;
                })()}
              </p>
            </div>
            <div className="text-2xl font-mono text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">{refAngle.toFixed(0)}°</div>
          </div>

          {/* Trig Values Table */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-slate-800/40 rounded-xl border border-white/5">
              <div className="w-1.5 h-10 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
              <div className="flex-1">
                <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Cosine (x)</p>
                <p className="text-xl font-mono text-cyan-50 font-medium">{f(cosValue)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-800/40 rounded-xl border border-white/5">
              <div className="w-1.5 h-10 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,114,182,0.5)]"></div>
              <div className="flex-1">
                <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Sine (y)</p>
                <p className="text-xl font-mono text-rose-50 font-medium">{f(sinValue)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-800/20 rounded-xl border border-white/5">
              <div className="w-1.5 h-10 bg-indigo-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-tighter mb-0.5">Tangent (sin/cos)</p>
                <p className="text-xl font-mono text-slate-300">
                  {Math.abs(cosValue) < 0.001 ? '∞' : f(sinValue / cosValue)}
                </p>
              </div>
            </div>
          </div>

          {/* Jump To Reference */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase text-slate-500 font-bold">Jump To Reference</p>
            <div className="grid grid-cols-4 gap-2">
              {SIGNIFICANT_ANGLES.map(angle => (
                <button 
                  key={angle}
                  onClick={() => setAngleDeg(angle)}
                  className={`
                    p-2 text-[11px] font-mono rounded-md border border-white/5 transition-all
                    ${angleDeg === angle 
                      ? 'bg-indigo-600 ring-2 ring-indigo-400 text-white' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}
                  `}
                >
                  {angle}°
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-950/50 flex items-center justify-between">
          <p className="text-[10px] text-slate-500 italic tracking-wide font-medium">Lab Status: CALIBRATED</p>
          <RotateCcw 
            size={14} 
            className="text-slate-500 cursor-pointer hover:text-indigo-400 transition-colors"
            onClick={() => setAngleDeg(0)}
          />
        </div>
      </aside>

      {/* Main Content: The Visualizer */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Atmospheric Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.08),transparent_75%)] pointer-events-none"></div>

        <div className="flex-1 flex items-center justify-center relative p-8">
          {/* Coordinate Info Badge */}
          <div className="absolute top-10 right-10 p-5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
            <p className="text-[10px] uppercase text-indigo-400 font-bold mb-1 tracking-[0.1em]">Target Coordinates (x, y)</p>
            <p className="text-2xl font-mono text-white tracking-tight">({f(cosValue)}, {f(sinValue)})</p>
          </div>

          <div className="relative w-full max-w-[600px] aspect-square group">
            <svg 
              ref={svgRef}
              viewBox="0 0 500 500" 
              className="w-full h-full drop-shadow-2xl select-none"
              onMouseDown={onMouseDown}
              onTouchStart={(e) => {
                setIsDragging(true);
                handleInteraction(e);
              }}
              onTouchEnd={() => setIsDragging(false)}
              onTouchMove={(e) => {
                if (isDragging) handleInteraction(e);
              }}
            >
              {/* Grid Lines */}
              <line x1="0" y1="250" x2="500" y2="250" stroke="#1e293b" strokeWidth="1" />
              <line x1="250" y1="0" x2="250" y2="500" stroke="#1e293b" strokeWidth="1" />
              
              {/* Axis Label Points */}
              <circle cx="450" cy="250" r="3" fill="#334155" />
              <circle cx="50" cy="250" r="3" fill="#334155" />
              <circle cx="250" cy="50" r="3" fill="#334155" />
              <circle cx="250" cy="450" r="3" fill="#334155" />

              {/* The Unit Circle Base */}
              <circle 
                cx="250" cy="250" r={radius} 
                fill="none" 
                stroke="#334155" 
                strokeWidth="2" 
                strokeDasharray="4 4" 
              />
              <circle 
                cx="250" cy="250" r={radius} 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="1" 
                opacity="0.05" 
              />

              {/* Projection Lines */}
              <motion.line 
                x1={center} y1={targetY} x2={targetX} y2={targetY}
                stroke={COLORS.cos} strokeWidth="4" strokeLinecap="round"
                animate={{ x2: targetX, y1: targetY, y2: targetY }}
              />
              <motion.line 
                x1={targetX} y1={center} x2={targetX} y2={targetY}
                stroke={COLORS.sin} strokeWidth="4" strokeLinecap="round"
                strokeDasharray="4"
                animate={{ x1: targetX, x2: targetX, y2: targetY }}
              />

              {/* Angle Arc */}
              <path 
                d={`M ${center + 50} ${center} A 50 50 0 ${angleDeg > 180 ? 1 : 0} 0 ${center + 50 * cosValue} ${center - 50 * sinValue}`}
                fill="none"
                stroke={COLORS.accent}
                strokeWidth="2"
              />

              {/* Reference Angle Shading (Subtle Triangle) */}
              <motion.path
                animate={{
                  d: `M 250 250 L ${targetX} ${targetY} L ${targetX} 250 Z`
                }}
                fill={COLORS.ref}
                opacity="0.05"
              />

              {/* Reference Angle Arc (Subtle) */}
              <motion.g initial={false}>
                <motion.path 
                  animate={{
                    d: (() => {
                      const r = 75;
                      const norm = ((angleDeg % 360) + 360) % 360;
                      let startX, startY, endX, endY, largeArc, sweep;
                      
                      // For reference angles, we always draw from target to nearest x-axis
                      endX = center + r * cosValue; 
                      endY = center - r * sinValue;

                      if (norm <= 90) {
                        startX = center + r; startY = center; sweep = 0;
                      } else if (norm <= 180) {
                        startX = center - r; startY = center; sweep = 1;
                      } else if (norm <= 270) {
                        startX = center - r; startY = center; sweep = 0;
                      } else {
                        startX = center + r; startY = center; sweep = 1;
                      }
                      
                      largeArc = 0;
                      return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} ${sweep} ${endX} ${endY}`;
                    })()
                  }}
                  fill="none"
                  stroke={COLORS.ref}
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  opacity="0.8"
                />
                
                <motion.text
                  animate={{
                    x: (() => {
                      const r = 95; 
                      const norm = ((angleDeg % 360) + 360) % 360;
                      const midAngle = norm <= 90 ? (norm / 2) : norm <= 180 ? 180 - (refAngle / 2) : norm <= 270 ? 180 + (refAngle / 2) : 360 - (refAngle / 2);
                      return center + r * Math.cos(degToRad(midAngle));
                    })(),
                    y: (() => {
                      const r = 95;
                      const norm = ((angleDeg % 360) + 360) % 360;
                      const midAngle = norm <= 90 ? (norm / 2) : norm <= 180 ? 180 - (refAngle / 2) : norm <= 270 ? 180 + (refAngle / 2) : 360 - (refAngle / 2);
                      return center - r * Math.sin(degToRad(midAngle));
                    })()
                  }}
                  fill={COLORS.ref}
                  fontSize="18"
                  className="italic font-serif font-bold select-none"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  α
                </motion.text>
              </motion.g>

              {/* Radius Vector */}
              <motion.line 
                x1="250" y1="250" x2={targetX} y2={targetY}
                stroke="white" strokeWidth="2"
              />

              {/* Termination Point */}
              <motion.g animate={{ cx: targetX, cy: targetY }}>
                <circle cx={targetX} cy={targetY} r="12" fill="white" className="blur-[4px] opacity-20" />
                <circle cx={targetX} cy={targetY} r="8" fill="white" className="drop-shadow-[0_0_10px_#fff]" />
                <circle cx={targetX} cy={targetY} r="4" fill={COLORS.accent} />
              </motion.g>

              {/* Invisible touch area */}
              <circle cx={targetX} cy={targetY} r="25" fill="transparent" className="cursor-pointer" />
            </svg>
          </div>

          {/* Bottom Legend */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-12 bg-slate-950/40 p-5 rounded-full border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 bg-cyan-400 rounded-sm shadow-[0_0_8px_rgba(34,211,238,0.4)]"></div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Adjacent / Cosine</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 bg-rose-500 rounded-sm shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Opposite / Sine</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 bg-white rounded-sm shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Hypotenuse (r=1)</span>
            </div>
          </div>
        </div>

        {/* Mobile Header Overlays */}
        <div className="lg:hidden p-6 border-b border-white/5 bg-slate-950 flex justify-between items-center">
            <div>
              <h1 className="text-[10px] uppercase tracking-widest font-black text-indigo-400">Unit Circle</h1>
              <p className="text-2xl font-bold text-white tabular-nums">{angleDeg.toFixed(1)}°</p>
            </div>
            <div className="flex gap-4">
               <div>
                 <p className="text-[8px] text-slate-500 uppercase font-bold">COS</p>
                 <p className="text-cyan-400 font-mono font-bold text-sm tracking-tighter">{cosValue.toFixed(3)}</p>
               </div>
               <div>
                 <p className="text-[8px] text-slate-500 uppercase font-bold">SIN</p>
                 <p className="text-rose-400 font-mono font-bold text-sm tracking-tighter">{sinValue.toFixed(3)}</p>
               </div>
            </div>
        </div>
      </main>
    </div>
  );
}

