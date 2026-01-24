import React, { useEffect, useState, useRef } from 'react';
import { X, Trophy, Zap, Castle, ShieldAlert, Skull, Sword, Activity } from 'lucide-react';

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
    // --- STATE ---
    const [showClouds, setShowClouds] = useState(false);
    const [battleViewReady, setBattleViewReady] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [defenderShake, setDefenderShake] = useState(false);
    const [logsBuffer, setLogsBuffer] = useState<string[]>([]);
    
    // --- AUDIO LOGIC ---
    useEffect(() => {
        if (isOpen) {
            setShowClouds(true);
            // Try/Catch for audio in case file is missing
            try {
                const audio = new Audio('/assets/combat_music.mp3'); 
                audio.loop = true;
                audio.volume = 1.0;
                audioRef.current = audio;
                setTimeout(() => {
                    setBattleViewReady(true);
                    audio.play().catch(e => console.log("Audio autoplay blocked/missing", e));
                }, 500);
            } catch (e) {
                console.error("Audio setup failed", e);
                setBattleViewReady(true); // Ensure view shows even if audio fails
            }

            setTimeout(() => {
                setShowClouds(false); 
            }, 1200);

        } else {
            if (audioRef.current) {
                const fadeOut = setInterval(() => {
                    if (audioRef.current && audioRef.current.volume > 0.05) {
                        audioRef.current.volume -= 0.05;
                    } else {
                        clearInterval(fadeOut);
                        audioRef.current?.pause();
                        audioRef.current = null;
                    }
                }, 100);
            }
            setBattleViewReady(false);
        }
        return () => { audioRef.current?.pause(); };
    }, [isOpen]);

    // --- VISUAL LOGIC ---
    useEffect(() => {
        if (!isOpen) { setLogsBuffer([]); return; }
        if (logs.length > logsBuffer.length) {
            const newLog = logs[logs.length - 1];
            if (newLog.includes('BREACHED') || newLog.includes('SACKED') || newLog.includes('PHASE')) {
                setDefenderShake(true);
                setTimeout(() => setDefenderShake(false), 500);
            }
            setLogsBuffer(logs);
        }
    }, [logs, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto overflow-y-auto md:overflow-hidden bg-black/80">
            
            {/* --- CLOUD WIPE LAYER --- */}
            <div className={`fixed inset-0 z-[60] pointer-events-none transition-opacity duration-300 ${battleViewReady ? 'opacity-0 delay-1000' : 'opacity-100'}`}>
                   <div className={`absolute inset-y-0 left-0 w-[55%] bg-white transform transition-transform duration-700 ease-in-out ${battleViewReady ? '-translate-x-full' : 'translate-x-0'}`}
                        style={{ background: 'radial-gradient(circle at right, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)', clipPath: 'ellipse(100% 100% at 0% 50%)' }}></div>
                   <div className={`absolute inset-y-0 right-0 w-[55%] bg-white transform transition-transform duration-700 ease-in-out ${battleViewReady ? 'translate-x-full' : 'translate-x-0'}`}
                        style={{ background: 'radial-gradient(circle at left, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)', clipPath: 'ellipse(100% 100% at 100% 50%)' }}></div>
            </div>

            {/* --- BATTLE CONTENT --- */}
            <div className={`relative w-full h-full md:flex md:items-center md:justify-center transition-opacity duration-500 ${battleViewReady ? 'opacity-100' : 'opacity-0'}`}>
                
                {/* Background Image */}
                <div className="fixed inset-0 z-0">
                    <div className="w-full h-full bg-gradient-to-br from-[#1a0f0a] via-[#2d1b14] to-[#0f172a]"></div> 
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>

                {/* --- MAIN UI CONTAINER --- */}
                <div className="relative z-10 w-full min-h-screen md:min-h-0 md:w-[95%] md:max-w-6xl md:aspect-[21/9] bg-[#2d2d2d] md:rounded-xl border-x-0 md:border-[6px] border-[#5d4037] shadow-2xl flex flex-col overflow-hidden">
                    
                    {/* TOP BAR */}
                    <div className="h-16 bg-[#1a1a1a] border-b-4 border-[#3e2723] flex justify-between items-center px-4 md:px-6 z-20 shrink-0">
                         <div className="flex items-center gap-3">
                             <div className="bg-red-900/50 p-1 rounded border border-red-500/30 animate-pulse">
                                <Sword size={20} className="text-red-400" />
                             </div>
                             <h2 className="font-game text-lg md:text-xl text-[#d7ccc8] tracking-widest drop-shadow-md">
                                 BATTLE ZONE
                             </h2>
                         </div>
                         <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-[#d7ccc8]">
                             <X size={24} />
                         </button>
                    </div>

                    {/* --- BATTLEFIELD LAYOUT --- */}
                    <div className="flex-1 p-4 md:p-8 flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-4 overflow-y-auto md:overflow-hidden">
                        
                        {/* LEFT: PLAYER (Attacker) */}
                        <div className="order-2 md:order-1 col-span-4 flex flex-col items-center justify-center relative">
                            <div className="w-24 h-24 md:w-48 md:h-48 border-4 border-cyan-600 shadow-[0_0_30px_rgba(8,145,178,0.4)] bg-black relative rounded group shrink-0">
                                <img src="/assets/portrait_titan.png" className="w-full h-full object-cover opacity-80" alt="Attacker" />
                                <div className="absolute -bottom-3 inset-x-0 text-center">
                                    <span className="bg-cyan-900 border border-cyan-500 text-cyan-200 text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded">YOU</span>
                                </div>
                            </div>
                            <div className="mt-6 md:mt-8 w-full max-w-[200px]">
                                <div className="flex justify-between text-[10px] md:text-xs font-mono text-cyan-200 mb-1">
                                    <span>{attacker.unit}</span>
                                    <span>{attacker.power} DPS</span>
                                </div>
                                <div className="h-2 md:h-3 w-full bg-black border border-cyan-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 w-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* CENTER: ACTION & LOGS */}
                        <div className="order-1 md:order-2 col-span-4 flex flex-col items-center justify-between py-2 md:py-4 min-h-[150px] md:min-h-0">
                            
                            {/* LOGS / STATUS */}
                            <div className="flex-1 w-full flex flex-col items-center justify-center space-y-4">
                                {logs.length > 0 ? (
                                    <div className="animate-in zoom-in slide-in-from-bottom-5 duration-300 text-center">
                                         <span className="font-game text-2xl md:text-4xl text-yellow-500 drop-shadow-[0_4px_0_rgba(0,0,0,1)] text-stroke-black">
                                            {logs[logs.length-1].includes('BREACHED') ? 'CRITICAL HIT!' : 
                                             logs[logs.length-1].includes('FAILED') ? 'BLOCKED!' :
                                             logs[logs.length-1].includes('VICTORY') ? 'VICTORY!' : 
                                             logs[logs.length-1].includes('starting') ? 'DEPLOYING...' : 'ATTACKING...'}
                                         </span>
                                    </div>
                                ) : isRaiding ? (
                                    <div className="animate-pulse font-game text-xl text-cyan-400">CONNECTING...</div>
                                ) : (
                                    <div className="text-stone-500 font-game opacity-50">READY</div>
                                )}
                            </div>

                            {/* CONTROLS */}
                             {!result && !isRaiding && (
                                <button 
                                    onClick={onLaunch}
                                    className="relative group bg-gradient-to-b from-red-600 to-red-900 border-4 border-red-950 rounded-xl px-6 md:px-8 py-3 md:py-4 shadow-xl active:scale-95 transition-all mt-4 md:mt-0"
                                >
                                    <span className="font-game text-white text-lg md:text-xl tracking-widest drop-shadow-md flex items-center gap-2">
                                        <Sword size={20} /> RAID (100 XLM)
                                    </span>
                                </button>
                             )}
                             
                             {/* LOADING STATE */}
                             {isRaiding && !result && (
                                <button disabled className="mt-4 md:mt-0 bg-stone-800 border-2 border-stone-600 px-6 py-3 rounded-xl flex items-center gap-3 cursor-wait">
                                     <Activity className="animate-spin text-cyan-400" size={20} />
                                     <span className="font-mono text-stone-300 font-bold tracking-widest text-sm">BATTLE IN PROGRESS</span>
                                </button>
                             )}

                             {/* RESULT */}
                             {result && (
                                <div className="bg-black/80 border-2 border-yellow-500/50 p-6 rounded-xl text-center backdrop-blur-md animate-in zoom-in mt-4 md:mt-0">
                                    <h3 className={`font-game text-2xl md:text-3xl mb-2 ${result.success ? 'text-green-400' : 'text-red-500'}`}>
                                        {result.success ? 'RAID SUCCESSFUL' : 'RAID FAILED'}
                                    </h3>
                                    {result.success && <div className="text-yellow-400 font-mono text-lg md:text-xl">+ {result.reward} XLM</div>}
                                </div>
                             )}
                        </div>

                        {/* RIGHT: ENEMY (Defender) */}
                        <div className="order-3 md:order-3 col-span-4 flex flex-col items-center justify-center relative">
                             <div className={`w-24 h-24 md:w-48 md:h-48 border-4 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)] bg-black relative rounded transition-transform shrink-0 ${defenderShake ? 'animate-shake' : ''}`}>
                                <Castle size={48} className="absolute inset-0 m-auto text-red-800 opacity-50 md:scale-150" /> 
                                <div className="w-full h-full bg-red-900/10 flex items-center justify-center">
                                     <span className="font-game text-red-500 text-2xl md:text-4xl opacity-50">VS</span>
                                </div>
                                <div className="absolute -bottom-3 inset-x-0 text-center">
                                    <span className="bg-red-900 border border-red-500 text-red-200 text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded truncate max-w-[90%] inline-block">
                                        {defender.name}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-6 md:mt-8 w-full max-w-[200px] space-y-2">
                                <div className="flex justify-between text-[10px] md:text-xs font-mono text-red-200 mb-1">
                                    <span>WALL INTEGRITY</span>
                                    <span>{defender.defense} HP</span>
                                </div>
                                <div className="h-2 md:h-4 w-full bg-[#1a0f0a] border-2 border-[#fbbf24] rounded-sm overflow-hidden relative">
                                    <div className={`h-full bg-gradient-to-b from-green-500 to-green-700 transition-all duration-500 ease-out`}
                                         style={{ width: `${Math.max(0, 100 - (logs.length * 10))}%` }}></div> 
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
