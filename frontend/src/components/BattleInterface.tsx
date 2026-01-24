import React, { useEffect, useState, useRef } from 'react';
import { X, Trophy, Zap, Castle, ShieldAlert, Skull, Sword } from 'lucide-react';

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
            // Start Music Transition
            setShowClouds(true);
            const audio = new Audio('/assets/combat_music.mp3'); // User provided filename
            audio.loop = true;
            audio.volume = 1.0;
            audioRef.current = audio;
            
            // Cloud Timing Logic
            // 0s: Click (Open) -> Clouds In
            // 0.5s: Screen Covered -> Start Music -> Show Battle UI (hidden behind clouds)
            // 1.5s: Clouds Out -> Reveal UI
            
            setTimeout(() => {
                setBattleViewReady(true);
                audio.play().catch(e => console.log("Audio autoplay blocked", e));
            }, 500);

            setTimeout(() => {
                setShowClouds(false); // Part clouds
            }, 1200);

        } else {
            // Fade Out Music
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
        
        return () => {
             // Cleanup if unmounted abruptly
             audioRef.current?.pause();
        };
    }, [isOpen]);

    // --- VISUAL LOGIC ---
    // Watch logs to trigger shakes/splats
    useEffect(() => {
        if (!isOpen) { setLogsBuffer([]); return; }
        
        // If new logs come in, trigger effects
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
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
            
            {/* --- CLOUD WIPE LAYER --- */}
            {/* We keep this mounted but transparent when not animating to avoid re-renders or just simple CSS classes */}
            <div className={`absolute inset-0 z-[60] pointer-events-none transition-opacity duration-300 ${battleViewReady ? 'opacity-0 delay-1000' : 'opacity-100'}`}>
                   {/* Left Cloud Bank */}
                   <div className={`absolute inset-y-0 left-0 w-[55%] bg-white transform transition-transform duration-700 ease-in-out ${battleViewReady ? '-translate-x-full' : 'translate-x-0'}`}
                        style={{ background: 'radial-gradient(circle at right, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)', clipPath: 'ellipse(100% 100% at 0% 50%)' }}></div>
                   
                   {/* Right Cloud Bank */}
                   <div className={`absolute inset-y-0 right-0 w-[55%] bg-white transform transition-transform duration-700 ease-in-out ${battleViewReady ? 'translate-x-full' : 'translate-x-0'}`}
                        style={{ background: 'radial-gradient(circle at left, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)', clipPath: 'ellipse(100% 100% at 100% 50%)' }}></div>
            </div>


            {/* --- BATTLE CONTENT (Only render when ready behind clouds or fully visible) --- */}
            <div className={`relative w-full h-full bg-black/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-500 ${battleViewReady ? 'opacity-100' : 'opacity-0'}`}>
                
                {/* Background Image: Fantasy Battlefield */}
                <div className="absolute inset-0 z-0">
                    {/* Placeholder for Fantasy Village BG - Darkened */}
                    <div className="w-full h-full bg-gradient-to-br from-[#1a0f0a] via-[#2d1b14] to-[#0f172a]"></div> 
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>

                {/* --- MAIN UI CONTAINER: STONE TABLET --- */}
                <div className="relative z-10 w-[95%] max-w-6xl aspect-video md:aspect-[21/9] bg-[#2d2d2d] rounded-xl border-[6px] border-[#5d4037] shadow-2xl flex overflow-hidden">
                    
                    {/* TOP BAR: Header */}
                    <div className="absolute top-0 inset-x-0 h-16 bg-[#1a1a1a] border-b-4 border-[#3e2723] flex justify-between items-center px-6 z-20">
                         <div className="flex items-center gap-3">
                             <div className="bg-red-900/50 p-1 rounded border border-red-500/30 animate-pulse">
                                <Sword size={20} className="text-red-400" />
                             </div>
                             <h2 className="font-game text-xl text-[#d7ccc8] tracking-widest drop-shadow-md">
                                 BATTLE ZONE
                             </h2>
                         </div>
                         <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-[#d7ccc8]">
                             <X size={24} />
                         </button>
                    </div>

                    {/* --- BATTLEFIELD LAYOUT --- */}
                    <div className="w-full h-full mt-16 p-8 grid grid-cols-12 gap-4">
                        
                        {/* LEFT: PLAYER (Attacker) */}
                        <div className="col-span-4 flex flex-col items-center justify-center relative">
                            {/* Portrait */}
                            <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-cyan-600 shadow-[0_0_30px_rgba(8,145,178,0.4)] bg-black relative rounded group">
                                <img src="/assets/portrait_titan.png" className="w-full h-full object-cover opacity-80" alt="Attacker" />
                                <div className="absolute -bottom-4 inset-x-0 text-center">
                                    <span className="bg-cyan-900 border border-cyan-500 text-cyan-200 text-xs font-bold px-3 py-1 rounded">
                                        YOU
                                    </span>
                                </div>
                            </div>
                            
                            {/* HP / Status */}
                            <div className="mt-8 w-full max-w-[200px]">
                                <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                                    <span>{attacker.unit}</span>
                                    <span>{attacker.power} DPS</span>
                                </div>
                                <div className="h-3 w-full bg-black border border-cyan-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 w-full"></div>
                                </div>
                            </div>
                        </div>


                        {/* CENTER: ACTION & LOGS */}
                        <div className="col-span-4 flex flex-col items-center justify-between py-4">
                            
                            {/* Visual Feedback Area */}
                            <div className="flex-1 w-full flex flex-col items-center justify-center space-y-4">
                                {/* Hit Splats (Simulated from logs) */}
                                {logs.length > 0 && (
                                    <div className="animate-in zoom-in slide-in-from-bottom-5 duration-300">
                                         <span className="font-game text-4xl text-yellow-500 drop-shadow-[0_4px_0_rgba(0,0,0,1)] text-stroke-black">
                                            {logs[logs.length-1].includes('BREACHED') ? 'CRITICAL HIT!' : 
                                             logs[logs.length-1].includes('FAILED') ? 'BLOCKED!' :
                                             logs[logs.length-1].includes('VICTORY') ? 'VICTORY!' : 'ATTACKING...'}
                                         </span>
                                    </div>
                                )}
                            </div>

                            {/* RAID BUTTONS (Bottom Center) */}
                             {!result && !isRaiding && (
                                <button 
                                    onClick={onLaunch}
                                    className="relative group bg-gradient-to-b from-red-600 to-red-900 border-4 border-red-950 rounded-xl px-8 py-4 shadow-xl active:scale-95 transition-all"
                                >
                                    <span className="font-game text-white text-xl tracking-widest drop-shadow-md flex items-center gap-2">
                                        <Sword size={24} /> RAID (100 XLM)
                                    </span>
                                </button>
                             )}
                             
                             {/* Result Banner */}
                             {result && (
                                <div className="bg-black/80 border-2 border-yellow-500/50 p-6 rounded-xl text-center backdrop-blur-md animate-in zoom-in">
                                    <h3 className={`font-game text-3xl mb-2 ${result.success ? 'text-green-400' : 'text-red-500'}`}>
                                        {result.success ? 'RAID SUCCESSFUL' : 'RAID FAILED'}
                                    </h3>
                                    {result.success && <div className="text-yellow-400 font-mono text-xl">+ {result.reward} XLM</div>}
                                </div>
                             )}

                        </div>


                        {/* RIGHT: ENEMY (Defender) */}
                        <div className="col-span-4 flex flex-col items-center justify-center relative">
                             {/* Portrait */}
                             <div className={`w-32 h-32 md:w-48 md:h-48 border-4 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)] bg-black relative rounded transition-transform ${defenderShake ? 'animate-shake' : ''}`}>
                                <Castle size={64} className="absolute inset-0 m-auto text-red-800 opacity-50" /> 
                                {/* Placeholder for Castle Image */}
                                <div className="w-full h-full bg-red-900/10 flex items-center justify-center">
                                     <span className="font-game text-red-500 text-4xl opacity-50">VS</span>
                                </div>

                                <div className="absolute -bottom-4 inset-x-0 text-center">
                                    <span className="bg-red-900 border border-red-500 text-red-200 text-xs font-bold px-3 py-1 rounded">
                                        {defender.name}
                                    </span>
                                </div>
                            </div>
                            
                            {/* HP / Status */}
                            <div className="mt-8 w-full max-w-[200px] space-y-2">
                                <div className="flex justify-between text-xs font-mono text-red-200 mb-1">
                                    <span>WALL INTEGRITY</span>
                                    <span>{defender.defense} HP</span>
                                </div>
                                {/* Gold Frame HP Bar */}
                                <div className="h-4 w-full bg-[#1a0f0a] border-2 border-[#fbbf24] rounded-sm overflow-hidden relative">
                                    <div className={`h-full bg-gradient-to-b from-green-500 to-green-700 transition-all duration-500 ease-out`}
                                         style={{ width: `${Math.max(0, 100 - (logs.length * 10))}%` }}></div> 
                                         {/* Simulated Damage based on log progress since we don't have exact HP scaling in props yet */}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

             {/* Hidden Audio */}
             {/* Note to User: Please ensure '26. Combat Music.mp3' is renamed to 'combat_music.mp3' and placed in public/assets/ */}
             {/* We create the audio object in useEffect, but we can also place a fallback element here just in case */}
        </div>
    );
};
