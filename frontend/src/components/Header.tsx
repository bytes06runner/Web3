import React from 'react';
import { LogOut, Wifi, Lock, ShieldAlert } from 'lucide-react';

interface HeaderProps {
    balance: string;
    apy: string;
    username: string;
    onLogout: () => void;
    walletAddress: string | null;
    onConnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({ balance, apy, username, onLogout, walletAddress, onConnect }) => {
    return (
        <div className="w-full relative z-50 mb-16 pt-4 px-2 md:px-0 flex justify-center">
            
            {/* MAIN STRUCTURE: Heavy Oak Beam */}
            <div className="relative w-full max-w-5xl h-32 flex items-center justify-center">
                
                {/* 1. The Beam (Background) */}
                <div className="absolute inset-x-0 top-4 bottom-4 z-10 flex items-center justify-center filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)]">
                    <img 
                        src="/assets/wood_banner.png" 
                        className="w-full h-full object-fill md:object-cover rounded-xl filter brightness-75 contrast-125 border-y-4 border-[#2a1a10] shadow-inner"
                        alt="HUD Beam" 
                    />
                    {/* Rust Iron Bands */}
                    <div className="absolute left-6 md:left-24 top-0 bottom-0 w-6 md:w-8 bg-gradient-to-b from-stone-600 via-stone-400 to-stone-700 border-x-2 border-black/50 shadow-lg flex flex-col justify-between py-1">
                        <div className="w-full h-1 bg-black/30"></div><div className="w-full h-1 bg-black/30"></div><div className="w-full h-1 bg-black/30"></div>
                    </div>
                    <div className="absolute right-6 md:right-24 top-0 bottom-0 w-6 md:w-8 bg-gradient-to-b from-stone-600 via-stone-400 to-stone-700 border-x-2 border-black/50 shadow-lg flex flex-col justify-between py-1">
                        <div className="w-full h-1 bg-black/30"></div><div className="w-full h-1 bg-black/30"></div><div className="w-full h-1 bg-black/30"></div>
                    </div>
                </div>

                {/* 2. Content On The Beam */}
                <div className="relative z-20 w-full h-full flex items-center justify-between px-2 md:px-32">
                    
                    {/* Left: Stellar Balance */}
                    <div className="hidden md:flex items-center gap-2 bg-[#1a1a1a] border-2 border-[#555] px-4 py-1.5 rounded-lg shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] transform -rotate-1 origin-right">
                         <div className="chest-gold w-10 h-10 flex-shrink-0 animate-bounce-slow filter drop-shadow"></div>
                         <div className="flex flex-col">
                             <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest leading-none">Balance</span>
                             <span className="font-game text-white text-base drop-shadow-md">{balance} XLM</span>
                         </div>
                    </div>

                    {/* Center: SUPERCELL STYLE TITLE EMBLEM */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-30">
                        {/* The Plaque Container */}
                        <div className="relative bg-gradient-to-b from-amber-800 via-yellow-950 to-amber-950 px-10 py-3 rounded-xl border-4 border-[#2a1a10] shadow-[0_0_0_2px_#fbbf24,0_0_40px_rgba(0,0,0,1)] transform skew-x-[-3deg]">
                            
                            {/* Inner Highlight Ring */}
                            <div className="absolute inset-0 border-t border-yellow-400/30 rounded-lg pointer-events-none"></div>

                            {/* TEXT COMPOSITION ROOT */}
                            <div className="relative flex justify-center items-center h-12 w-[300px] md:w-[400px]">
                                
                                {/* Layer 1: MASSIVE BLACK OUTLINE (The Sticker Effect) */}
                                <h1 className="absolute inset-0 font-game text-3xl md:text-5xl tracking-widest leading-none text-center transform skew-x-[3deg] z-10"
                                    style={{
                                        WebkitTextStroke: '12px black', 
                                        color: 'black',
                                        filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.8))'
                                    }}
                                >
                                    YIELD RAIDERS
                                </h1>

                                {/* Layer 2: INNER BROWN STROKE (Definition) */}
                                <h1 className="absolute inset-0 font-game text-3xl md:text-5xl tracking-widest leading-none text-center transform skew-x-[3deg] z-20"
                                    style={{
                                        WebkitTextStroke: '4px #421C02', // Dark Brown Stroke
                                        color: '#421C02',
                                    }}
                                >
                                    YIELD RAIDERS
                                </h1>

                                {/* Layer 3: GOLD GRADIENT FILL (The shiny part) */}
                                <h1 className="absolute inset-0 font-game text-3xl md:text-5xl tracking-widest leading-none text-center transform skew-x-[3deg] z-30"
                                    style={{
                                        background: 'linear-gradient(to bottom, #FFF200 0%, #F7931E 50%, #C1272D 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    YIELD RAIDERS
                                </h1>
                                
                                {/* Layer 4: TOP HIGHLIGHT (Bevel Effect) */}
                                <h1 className="absolute inset-0 font-game text-3xl md:text-5xl tracking-widest leading-none text-center transform skew-x-[3deg] z-30 pointer-events-none opacity-80"
                                     style={{
                                        backgroundImage: 'linear-gradient(to bottom, white 0%, transparent 40%, transparent 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)' // Only top part
                                    }}
                                >
                                    YIELD RAIDERS
                                </h1>

                            </div>
                        </div>
                    </div>

                    {/* Right: Vault Status */}
                    <div className="hidden md:flex items-center gap-2 bg-[#1a1a1a] border-2 border-[#555] px-4 py-1.5 rounded-lg shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] transform rotate-1 origin-left">
                         <div className="flex flex-col items-end">
                             <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest leading-none">Vault APY</span>
                             <span className="font-game text-green-400 text-base drop-shadow-md">{apy}</span>
                         </div>
                         <div className="chest-elixir w-10 h-10 flex-shrink-0 animate-pulse-slow filter drop-shadow"></div>
                    </div>
                </div>

                {/* 3. Hanging Commander Profile */}
                <div className="absolute -bottom-10 left-4 md:left-16 z-0 flex flex-col items-center group cursor-default">
                    {/* Chain Links */}
                    <div className="flex gap-8 -mt-2">
                        <div className="w-1 h-8 bg-stone-600 border-x border-black shadow-lg"></div>
                        <div className="w-1 h-8 bg-stone-600 border-x border-black shadow-lg"></div>
                    </div>
                    {/* Plate */}
                    <div className="bg-slate-800 border-2 border-slate-500 rounded px-3 py-1.5 shadow-xl flex items-center gap-2 -mt-1 transform group-hover:rotate-2 transition-transform origin-top">
                        <ShieldAlert size={14} className="text-green-500" />
                        <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 font-mono leading-none tracking-widest">COMMANDER</span>
                            <span className="font-mono text-green-400 font-bold text-xs tracking-wider glow-text-green">{username}</span>
                        </div>
                    </div>
                </div>

                {/* 4. Docked Wallet Key */}
                <div className="absolute -bottom-8 right-4 md:right-16 z-30">
                     {!walletAddress ? (
                        <button 
                            onClick={onConnect}
                            className="bg-blue-900 border-4 border-blue-950 rounded-full px-5 py-2 shadow-[0_0_15px_rgba(59,130,246,0.5)] active:translate-y-1 transition-all group overflow-hidden relative"
                        >
                            <span className="relative z-10 font-game text-white tracking-widest text-xs flex items-center gap-2">
                                <Wifi size={14} className="animate-pulse" /> LINK WALLET
                            </span>
                            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-blue-500/30 blur-sm group-hover:h-full transition-all duration-500"></div>
                        </button>
                     ) : (
                        <button 
                            onClick={onLogout}
                            className="bg-yellow-700 border-4 border-yellow-900 rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 active:border-b-0 active:translate-y-1 transition-transform"
                        >
                            <Lock size={14} className="text-yellow-100" />
                            <span className="font-mono text-white font-bold text-xs drop-shadow">
                                {walletAddress.substring(0,4)}...{walletAddress.substring(walletAddress.length-4)}
                            </span>
                        </button>
                     )}
                </div>

            </div>
        </div>
    );
};
