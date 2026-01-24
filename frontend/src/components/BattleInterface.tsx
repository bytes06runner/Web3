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

    // Derived States from Logs for Animations
    const wallBreached = logs.some(l => l.includes('WALL BREACHED'));
    const armyEliminated = logs.some(l => l.includes('ARMY ELIMINATED'));
    const townhallSacked = logs.some(l => l.includes('TOWNHALL SACKED'));

    useEffect(() => {
        if (!isOpen) {
            setVisibleLogs([]);
            return;
        }
        setVisibleLogs(logs); 
    }, [isOpen, logs]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [visibleLogs]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <div className="relative w-full h-full md:h-[85vh] md:max-w-5xl bg-[#050b14] border border-cyan-500/30 rounded-lg shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden">
                
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
                    
                    {/* Left Panel: Stats */}
                    <div className="col-span-3 border-b md:border-b-0 md:border-r border-white/5 pb-6 md:pb-0 md:pr-6 flex flex-col gap-6">
                        <div className="bg-[#0a1120] p-4 rounded-lg border-l-2 border-cyan-500">
                            <h3 className="text-gray-400 text-xs font-mono mb-1">BALANCE</h3>
                            <div className="text-2xl text-white font-bold tracking-tight">{balance} XLM</div>
                        </div>
                        
                        <div className="mt-auto">
                            <h3 className="text-cyan-400 font-mono text-sm mb-4 border-b border-cyan-500/20 pb-2">ATTACKER STATUS</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">UNIT</span>
                                    <span className="text-white">{attacker.unit}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">TOTAL DPS</span>
                                    <span className="text-cyan-300 font-mono text-xl">{attacker.power}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center Panel: Visualization */}
                    <div className="col-span-6 flex flex-col relative">
                        
                        {/* Dynamic Combat Phases */}
                        <div className="flex flex-col gap-5 mb-8 mt-2 relative">
                            
                            {/* PHASE 1: WALL */}
                            <div className="relative group">
                                <div className="flex justify-between text-xs font-mono text-blue-300 mb-1">
                                    <span>PHASE 1: THE WALL</span>
                                    <span>{wallBreached ? '0%' : '100%'} INTEGRITY</span>
                                </div>
                                <div className="h-4 w-full bg-black/50 rounded overflow-hidden border border-blue-900/30 relative">
                                    <div className={`h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-[1500ms] ease-out ${wallBreached ? 'w-0' : 'w-full'}`}></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/50 font-mono">
                                        {wallBreached ? 'BREACHED' : 'SHIELD ACTIVE'}
                                    </div>
                                </div>
                            </div>

                            {/* PHASE 2: ARMY */}
                            <div className="relative group">
                                <div className="flex justify-between text-xs font-mono text-red-300 mb-1">
                                    <span>PHASE 2: DEFENSE ARMY</span>
                                    <span>{armyEliminated ? '0%' : '100%'} STRENGTH</span>
                                </div>
                                <div className="h-4 w-full bg-black/50 rounded overflow-hidden border border-red-900/30 relative">
                                    <div className={`h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all duration-[2000ms] ease-out ${armyEliminated ? 'w-0' : 'w-full'}`}></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/50 font-mono">
                                        {armyEliminated ? 'ELIMINATED' : 'STANDING GUARD'}
                                    </div>
                                </div>
                            </div>

                            {/* PHASE 3: TOWNHALL */}
                            <div className="relative group">
                                <div className="flex justify-between text-xs font-mono text-yellow-300 mb-1">
                                    <span>PHASE 3: TOWNHALL</span>
                                    <span>{townhallSacked ? '0 HP' : '1000 HP'}</span>
                                </div>
                                <div className="h-4 w-full bg-black/50 rounded overflow-hidden border border-yellow-900/30 relative">
                                    <div className={`h-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-all duration-[1500ms] ease-out ${townhallSacked ? 'w-0' : 'w-full'}`}></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-black/50 font-bold font-mono">
                                        {townhallSacked ? 'SACKED' : 'SECURE'}
                                    </div>
                                </div>
                            </div>
                        </div>
    
                        {/* Terminal Log */}
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-6 bg-white/5 flex items-center px-2 gap-2 border-b border-white/5">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-[10px] text-gray-500 ml-2">BATTLE_LOG.TXT // STREAMING</span>
                            </div>
                            <div className="mt-6 h-full overflow-y-auto pr-2 space-y-2 pb-4 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                                {visibleLogs.map((log, i) => (
                                    <div key={i} className={`
                                        transition-all duration-300 animate-in slide-in-from-left-2
                                        ${log.includes('VICTORY') || log.includes('SACKED') ? 'text-green-400 font-bold border-l-2 border-green-500 pl-2 bg-green-500/5' : ''}
                                        ${log.includes('FAILED') || log.includes('LOST') ? 'text-red-400 font-bold border-l-2 border-red-500 pl-2 bg-red-500/5' : ''}
                                        ${log.includes('PHASE') ? 'text-cyan-300 font-bold pt-2' : ''}
                                        ${log.includes('BREACHED') || log.includes('ELIMINATED') ? 'text-yellow-400' : ''}
                                        ${!log.includes('VICTORY') && !log.includes('FAILED') && !log.includes('PHASE') ? 'text-cyan-200/70' : ''}
                                    `}>
                                        <span className="mr-2 opacity-30 text-[10px] font-mono">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                                        {log}
                                    </div>
                                ))}
                                <div ref={logEndRef} />
                            </div>
                        </div>

                        {/* Result Overlay */}
                        {result && visibleLogs.length === logs.length && (
                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm bg-black/90 border border-cyan-500/50 px-8 py-6 rounded-xl backdrop-blur-xl animate-in fade-in zoom-in slide-in-from-bottom-5 text-center shadow-[0_0_50px_rgba(6,182,212,0.3)] z-20">
                                <div className={`text-3xl font-bold mb-2 ${result.success ? 'text-green-400' : 'text-red-500'}`}>
                                    {result.success ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}
                                </div>
                                <div className="text-sm text-gray-400 font-mono mb-4">
                                    DESTRUCTION: {result.destruction}%
                                </div>
                                {result.success && (
                                    <div className="bg-green-900/20 border border-green-500/30 p-2 rounded text-green-300 font-mono text-lg">
                                        + {result.reward} XLM
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        {!result && !isRaiding && (
                            <div className="absolute bottom-6 left-6 flex gap-4">
                                <button 
                                    onClick={onLaunch}
                                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded clip-path-polygon hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all uppercase tracking-wider flex items-center gap-2"
                                >
                                    <Zap size={18} fill="black" /> STAKE 100 XLM & RAID
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500/10 font-bold py-3 px-8 rounded uppercase tracking-wider transition-all"
                                >
                                    Abort
                                </button>
                            </div>
                        )}
                        
                        {isRaiding && (
                             <div className="absolute bottom-6 left-6 flex gap-4">
                                <button disabled className="bg-slate-800 text-slate-400 font-bold py-3 px-8 rounded cursor-not-allowed uppercase tracking-wider flex items-center gap-2 border border-slate-700">
                                    <Activity size={16} className="animate-spin text-cyan-500" /> BATTLE IN PROGRESS...
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Target Intel */}
                    <div className="col-span-3 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-6 flex flex-col gap-6">
                        <div className="bg-[#0a1120] border border-red-500/20 rounded-lg p-4">
                            <h3 className="text-red-400 text-xs font-mono uppercase border-b border-red-500/20 pb-2 mb-3">Target Intel</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">DEFENSE</span>
                                    <span className="text-red-300 font-mono text-lg">{defender.defense}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">UNIT TYPE</span>
                                    <span className="text-white font-mono">{defender.unit}</span>
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
