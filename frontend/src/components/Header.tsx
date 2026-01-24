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
                {/* Using existing wood_banner but darkening it and adding 'heavy' CSS effects */}
                <div className="absolute inset-0 z-10 flex items-center justify-center filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)]">
                    <img 
                        src="/assets/wood_banner.png" 
                        className="w-full h-full object-fill md:object-contain filter brightness-75 contrast-125"
                        alt="HUD Beam" 
                    />
                    {/* Rust Iron Bands (CSS Simulated) */}
                    <div className="absolute left-4 md:left-12 top-2 bottom-2 w-4 md:w-6 bg-gradient-to-b from-stone-700 via-stone-500 to-stone-800 border-x border-stone-900 shadow-inner"></div>
                    <div className="absolute right-4 md:right-12 top-2 bottom-2 w-4 md:w-6 bg-gradient-to-b from-stone-700 via-stone-500 to-stone-800 border-x border-stone-900 shadow-inner"></div>
                </div>

                {/* 2. Content On The Beam */}
                <div className="relative z-20 w-full h-full flex items-center justify-between px-8 md:px-24">
                    
                    {/* Left: Stellar Balance (Metal Plate) */}
                    <div className="hidden md:flex items-center gap-3 bg-[#1e1e1e] border-2 border-[#444] px-4 py-2 rounded-lg shadow-inner transform -rotate-1 skew-x-3">
                         <div className="chest-gold w-12 h-12 flex-shrink-0 animate-bounce-slow"></div>
                         <div className="flex flex-col transform skew-x--3">
                             <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest leading-none">Balance</span>
                             <span className="font-game text-white text-lg drop-shadow-md text-stroke-sm">{balance} XLM</span>
                         </div>
                    </div>

                    {/* Center: Title (Chiseled Gold) */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pt-2 text-center">
                         <h1 className="font-game text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-800 tracking-widest drop-shadow-[0_4px_0_rgba(0,0,0,0.8)] leading-none filter brightness-110" style={{ WebkitTextStroke: '1px #3f2c22' }}>
                            YIELD RAIDERS
                         </h1>
                    </div>

                    {/* Right: Vault Status (Metal Plate) */}
                    <div className="hidden md:flex items-center gap-3 bg-[#1e1e1e] border-2 border-[#444] px-4 py-2 rounded-lg shadow-inner transform rotate-1 -skew-x-3">
                         <div className="flex flex-col items-end transform skew-x-3">
                             <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest leading-none">Vault Status</span>
                             <span className="font-game text-green-400 text-lg drop-shadow-md text-stroke-sm">{apy}</span>
                         </div>
                         <div className="chest-elixir w-12 h-12 flex-shrink-0 animate-pulse-slow"></div>
                    </div>
                </div>

                {/* 3. Hanging Module: Commander Profile (Left) */}
                <div className="absolute -bottom-10 left-8 md:left-20 z-0 flex flex-col items-center group">
                    {/* Chains */}
                    <div className="w-full flex justify-between px-4 absolute -top-4">
                        <div className="w-1 h-6 bg-stone-700 border-x border-black"></div>
                        <div className="w-1 h-6 bg-stone-700 border-x border-black"></div>
                    </div>
                    {/* Iron Plate */}
                    <div className="bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-500 rounded px-4 py-1 shadow-xl flex items-center gap-2 transform origin-top group-hover:rotate-1 transition-transform">
                        <ShieldAlert size={14} className="text-green-500" />
                        <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 font-mono leading-none tracking-widest">COMMANDER</span>
                            <span className="font-mono text-green-400 font-bold text-xs tracking-wider glow-text-green">{username}</span>
                        </div>
                    </div>
                </div>

                {/* 4. Docked Module: Connect Wallet (Right) */}
                <div className="absolute -bottom-8 right-8 md:right-20 z-30">
                     {!walletAddress ? (
                        <button 
                            onClick={onConnect}
                            className="bg-gradient-to-b from-blue-600 to-blue-900 border-b-4 border-blue-950 rounded-xl px-6 py-2 shadow-[0_0_20px_rgba(37,99,235,0.6)] active:border-b-0 active:translate-y-1 transition-all group relative overflow-hidden"
                        >
                            {/* Mana Pulse */}
                            <div className="absolute inset-0 bg-blue-400/20 animate-pulse"></div>
                            <span className="relative z-10 font-game text-white tracking-widest flex items-center gap-2 text-sm shadow-sm">
                                <Wifi size={14} className="animate-ping-slow" /> LINK WALLET
                            </span>
                        </button>
                     ) : (
                        <button 
                            onClick={onLogout}
                            className="bg-gradient-to-b from-yellow-600 to-yellow-800 border-b-4 border-yellow-950 rounded-xl px-4 py-2 shadow-lg active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2"
                        >
                            <Lock size={14} className="text-yellow-200" />
                            <span className="font-mono text-yellow-100 font-bold text-xs drop-shadow-md">
                                {walletAddress.substring(0,4)}...{walletAddress.substring(walletAddress.length-4)}
                            </span>
                        </button>
                     )}
                </div>

            </div>
        </div>
    );
};
