import React, { useEffect, useState, useRef } from 'react';
import { X, Trophy, Zap, Castle, Globe, Activity } from 'lucide-react';

interface BattleInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
    attacker: { name: string; power: number; unit: string };
    defender: { name: string; defense: number; unit: string };
    logs: string[];
    result: { success: boolean; destruction: number; reward: number } | null;
    onLaunch: () => void;
    isRaiding: boolean;
    balance: string;
    topCommanders: any[];
}

export const BattleInterface: React.FC<BattleInterfaceProps> = ({ 
    isOpen, onClose, attacker, defender, logs, result, onLaunch, isRaiding, balance, topCommanders
}) => {
    const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    // Simulate typing effect for logs
    useEffect(() => {
        if (!isOpen) {
            setVisibleLogs([]);
            return;
        }
        
        // If raiding, logs come in dynamically. If pre-loaded logs (unlikely in this flow), type them.
        // For now, let's just show logs as they come/change in the prop, 
        // OR better: rely on the parent to update logs array.
        // If parent updates logs, we want to auto-scroll.
        // BUT, if we want the typing effect for *past* logs when opening, we need the logic.
        // Let's assume logs prop *grows* over time.
        
        setVisibleLogs(logs); 

    }, [isOpen, logs]); // Simple sync for now, rely on parent timing or CSS animation

    // Auto-scroll logs
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [visibleLogs]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            {/* Main Container - Cyber Noir Border */}
            <div className="relative w-full h-full md:h-[80vh] md:max-w-5xl bg-[#050b14] border border-cyan-500/30 rounded-lg shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden">
                
                {/* Header Accents */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>

                {/* Top Bar */}
                <div className="flex justify-between items-center p-4 border-b border-white/5 bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                        <h2 className="text-cyan-400 font-mono tracking-widest text-lg flex items-center gap-2">
                             <Globe size={16} /> GLOBAL_NET // BATTLE_LINK_ESTABLISHED
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-6 p-6 overflow-y-auto md:overflow-hidden">
                    
                    {/* Left Panel: Stats & Info (3 Cols) */}
                    <div className="col-span-3 border-b md:border-b-0 md:border-r border-white/5 pb-6 md:pb-0 md:pr-6 flex flex-col gap-6">
                        {/* Balance Block */}
                        <div className="bg-[#0a1120] p-4 rounded-lg border-l-2 border-cyan-500">
                            <h3 className="text-gray-400 text-xs font-mono mb-1">BALANCE</h3>
                            <div className="text-2xl text-white font-bold tracking-tight">{balance} XLM</div>
                        </div>
                        <div className="bg-[#0a1120] p-4 rounded-lg border-l-2 border-cyan-500/50">
                            <h3 className="text-gray-400 text-xs font-mono mb-1">STAMINA</h3>
                            <div className="text-2xl text-white font-bold tracking-tight">100 / 100</div>
                        </div>

                        {/* Attacker Stats */}
                        <div className="mt-auto">
                            <h3 className="text-cyan-400 font-mono text-sm mb-4 border-b border-cyan-500/20 pb-2">ATTACKER STATUS</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">UNIT</span>
                                    <span className="text-white">{attacker.unit}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">POWER</span>
                                    <span className="text-cyan-300 font-mono">{attacker.power}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center Panel: Visualization (6 Cols) */}
                    <div className="col-span-6 flex flex-col relative">
                        
                        {/* Hexagon Battle Display */}
                        <div className="flex justify-center items-center gap-12 mb-8 mt-4 relative">
                            {/* Connection Line */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[1px] bg-gradient-to-r from-cyan-500/50 to-red-500/50"></div>

                            {/* Attacker Hex */}
                            <div className="relative group">
                                <div className="w-32 h-32 flex items-center justify-center relative">
                                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                                        <path d="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    <Zap size={48} className="text-cyan-400 z-10" />
                                </div>
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center w-40">
                                    <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">Attacker</div>
                                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500 w-full shadow-[0_0_10px_cyan]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Defender Hex */}
                            <div className="relative group">
                                <div className="w-32 h-32 flex items-center justify-center relative">
                                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                                        <path d="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    <Castle size={48} className="text-red-500 z-10" />
                                </div>
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center w-40">
                                    <div className="text-red-500 text-xs font-bold uppercase tracking-wider mb-1">{defender.name}</div>
                                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-red-500 transition-all duration-500 shadow-[0_0_10px_red]"
                                            style={{ width: `${Math.max(0, 100 - (result?.destruction || 0))}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terminal Log */}
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-6 bg-white/5 flex items-center px-2 gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-[10px] text-gray-500 ml-2">BATTLE_LOG.TXT</span>
                            </div>
                            <div className="mt-6 h-full overflow-y-auto pr-2 space-y-2 pb-4 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                                {visibleLogs.map((log, i) => (
                                    <div key={i} className={`
                                        ${log.includes('VICTORY') ? 'text-green-400 font-bold border-l-2 border-green-500 pl-2' : ''}
                                        ${log.includes('FAILED') || log.includes('BLOCKED') ? 'text-red-400 font-bold border-l-2 border-red-500 pl-2' : ''}
                                        ${log.includes('Breach') ? 'text-yellow-400' : ''}
                                        ${!log.includes('VICTORY') && !log.includes('FAILED') && !log.includes('Breach') ? 'text-cyan-200/80' : ''}
                                    `}>
                                        <span className="mr-2 opacity-50">[{String(i+1).padStart(2, '0')}]</span>
                                        {log}
                                    </div>
                                ))}
                                <div ref={logEndRef} />
                            </div>
                        </div>
                        
                        {/* Result Overlay (Optional final state) */}
                        {result && visibleLogs.length === logs.length && (
                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 border border-cyan-500/50 px-8 py-4 rounded-xl backdrop-blur-xl animate-in fade-in zoom-in slide-in-from-bottom-5">
                                <div className="text-center">
                                    <div className={`text-2xl font-bold mb-1 ${result.success ? 'text-green-400' : 'text-red-500'}`}>
                                        {result.success ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        DESTRUCTION: {result.destruction}% | REWARD: {result.reward} XLM
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {!result && !isRaiding && (
                            <div className="absolute bottom-6 left-6 flex gap-4">
                                <button 
                                    onClick={onLaunch}
                                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded clip-path-polygon hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all uppercase tracking-wider"
                                >
                                    Launch Raid
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500/10 font-bold py-3 px-8 rounded uppercase tracking-wider transition-all"
                                >
                                    Abort
                                </button>
                            </div>
                        )}
                        
                        {/* Raiding State Indicator */}
                        {isRaiding && (
                             <div className="absolute bottom-6 left-6 flex gap-4">
                                <button disabled className="bg-gray-800 text-gray-500 font-bold py-3 px-8 rounded cursor-not-allowed uppercase tracking-wider flex items-center gap-2">
                                    <Activity size={16} className="animate-spin" /> EXECUTING...
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Commander Stats (3 Cols) */}
                    <div className="col-span-3 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-6 flex flex-col gap-6">
                        <div className="bg-[#0a1120] border border-red-500/20 rounded-lg p-4">
                            <h3 className="text-red-400 text-xs font-mono uppercase border-b border-red-500/20 pb-2 mb-3">Target Intel</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">DEFENSE</span>
                                    <span className="text-red-300 font-mono">{defender.defense}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">UNIT TYPE</span>
                                    <span className="text-red-300 font-mono">{defender.unit}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col">
                            <h3 className="text-gray-500 text-xs font-mono uppercase mb-3 flex items-center gap-2">
                                <Trophy size={12} className="text-yellow-500" /> Top Commanders
                            </h3>
                            <div className="space-y-1 flex-1 overflow-y-auto pr-1">
                                {topCommanders.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded hover:bg-white/10 cursor-pointer">
                                        <span className={`text-xs ${i===0 ? 'text-yellow-400' : 'text-gray-300'}`}>{p.username || 'Unknown'}</span>
                                        <span className="text-xs font-mono text-cyan-500">{p.stats?.wins || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
