import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Crosshair, Cpu, Terminal } from 'lucide-react';

// Note: In frontend we might need to duplicate logic or fetch it if we want instant feedback before API call.
// For smooth UX, we'll duplicate the simple math estimation here for the "Scanner".

interface BreachTerminalProps {
    isOpen: boolean;
    onClose: () => void;
    attackerStats: any;
    opponent: any;
    onBreach: () => void;
}

export const BreachTerminal: React.FC<BreachTerminalProps> = ({ isOpen, onClose, attackerStats, opponent, onBreach }) => {
    const [phase, setPhase] = useState<'scan' | 'breach' | 'extract'>('scan');
    const [winProb, setWinProb] = useState(0);

    useEffect(() => {
        if (isOpen && opponent && attackerStats) {
            setPhase('scan');
            // Mock calc for UI feedback
            const atk = (attackerStats.wins || 0) * 5 + 100;
            const def = opponent.stats.defense || 50;
            const p = 1 / (1 + Math.exp(-0.1 * (atk - def)));
            setWinProb(Math.floor(p * 100));
        }
    }, [isOpen, opponent, attackerStats]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
                    onClick={onClose}
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/20 font-mono"
                >
                    {/* Header */}
                    <div className="bg-slate-950 p-2 border-b border-cyan-500/30 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-cyan-400 text-xs uppercase tracking-widest">
                            <Terminal size={14} /> TACTICAL_BREACH_V3.0 // TARGET_LOCKED
                        </div>
                        <button onClick={onClose} className="text-slate-500 hover:text-red-500 text-xs">[ABORT]</button>
                    </div>

                    <div className="p-8 min-h-[400px] flex flex-col items-center justify-center relative">
                        
                        {/* Phase 1: SCANNING */}
                        {phase === 'scan' && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="text-center w-full"
                            >
                                <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                                    <motion.div 
                                        animate={{ rotate: 360 }} 
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 border-2 border-dashed border-cyan-500/30 rounded-full"
                                    />
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1] }} 
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-4 border border-cyan-400 rounded-full opacity-50"
                                    />
                                    <Crosshair size={40} className="text-cyan-400" />
                                </div>
                                
                                <h3 className="text-2xl text-white font-bold mb-2 tracking-widest">ANALYZING DEFENSES</h3>
                                <div className="text-cyan-400 mb-8 font-mono text-sm">Target: {opponent?.username}</div>

                                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                                        <div className="text-xs text-slate-400 mb-1">WIN PROBABILITY</div>
                                        <div className="text-xl text-cyan-400 font-bold">{winProb}%</div>
                                    </div>
                                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                                        <div className="text-xs text-slate-400 mb-1">ESTIMATED LOOT</div>
                                        <div className="text-xl text-green-400 font-bold">LOG_SCALE_UNK</div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => { setPhase('breach'); setTimeout(onBreach, 2000); }} 
                                    className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500 px-8 py-3 rounded text-sm uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                                >
                                    INITIATE BREACH
                                </button>
                            </motion.div>
                        )}

                        {/* Phase 2: BREACHING (Animation) */}
                        {phase === 'breach' && (
                             <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center"
                             >
                                <div className="flex items-center justify-center gap-8 mb-8">
                                    <motion.div 
                                        initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                        className="text-cyan-400"
                                    >
                                        <Cpu size={64} />
                                        <div className="mt-2 text-xs">YOUR UNIT</div>
                                    </motion.div>
                                    <motion.div 
                                        animate={{ scale: [1, 1.5, 1], rotate: [0, 45, 0] }}
                                        className="text-red-500 font-bold text-2xl"
                                    >
                                        VS
                                    </motion.div>
                                    <motion.div 
                                        initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                        className="text-red-400"
                                    >
                                        <Shield size={64} />
                                        <div className="mt-2 text-xs">TARGET DEFENSE</div>
                                    </motion.div>
                                </div>
                                <div className="text-green-400 font-mono animate-pulse">
                                    &gt; INJECTING PAYLOAD...<br/>
                                    &gt; BYPASSING FIREWALL...
                                </div>
                             </motion.div>
                        )}
                    </div>
                    
                    {/* Footer / Decoration */}
                    <div className="bg-slate-950 p-2 border-t border-cyan-500/30 flex justify-between text-[10px] text-slate-600">
                        <span>SYS_READY</span>
                        <span>ENC_LEVEL_5</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
