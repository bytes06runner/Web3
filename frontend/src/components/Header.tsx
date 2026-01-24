import React from 'react';
import { LogOut, Wifi } from 'lucide-react';

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
        <div className="w-full relative z-50 mb-8 pt-6 px-2 md:px-0">
            {/* Wood Banner Background - FIXED ALIGNMENT */}
            <div className="wood-banner max-w-5xl mx-auto h-28 flex items-center justify-between px-8 md:px-16 relative drop-shadow-2xl">
                
                {/* Left: Stellar Balance - Vertically Centered */}
                <div className="flex items-center gap-4 h-full">
                    <div className="chest-gold w-16 h-16 md:w-20 md:h-20 flex-shrink-0 animate-bounce-slow filter drop-shadow-lg"></div>
                    <div className="flex flex-col justify-center h-full pt-2">
                        <span className="text-amber-200 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-shadow-sm mb-1 leading-none">Stellar Balance</span>
                        <span className="font-game text-white text-lg md:text-2xl drop-shadow-md text-stroke leading-none">{balance} XLM</span>
                    </div>
                </div>

                {/* Center: Title (Visible on Desktop) */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden md:block pt-2">
                     <h1 className="font-game text-4xl text-amber-400 tracking-widest text-stroke drop-shadow-xl opacity-90">YIELD RAIDERS</h1>
                </div>

                {/* Right: Vault Status - Vertically Centered */}
                <div className="flex items-center gap-4 h-full">
                    <div className="flex flex-col justify-center items-end h-full pt-2">
                        <span className="text-purple-200 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-shadow-sm mb-1 leading-none">Vault Status</span>
                         <span className="font-game text-green-400 text-lg md:text-2xl drop-shadow-md text-stroke leading-none">{apy}</span>
                    </div>
                    <div className="chest-elixir w-16 h-16 md:w-20 md:h-20 flex-shrink-0 animate-pulse-slow filter drop-shadow-lg"></div>
                </div>
            </div>
            
            {/* Floating Action Buttons */}
            <div className="max-w-5xl mx-auto flex justify-between px-6 -mt-3 relative z-10">
                 <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-xs font-mono text-gray-300 shadow-lg">
                    CMD: <span className="text-white font-bold tracking-wider">{username}</span>
                 </div>
                 <div className="flex gap-2">
                    {!walletAddress ? (
                        <button onClick={onConnect} className="bg-blue-600/80 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded-full flex items-center gap-2 border border-blue-400 shadow-lg transition-all hover:scale-105">
                            <Wifi size={12} /> Connect Wallet
                        </button>
                    ) : (
                        <button onClick={onLogout} className="bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs px-4 py-1.5 rounded-full flex items-center gap-2 border border-red-500/30 shadow-lg transition-all hover:scale-105">
                            <LogOut size={12} /> Logout
                        </button>
                    )}
                 </div>
            </div>
        </div>
    );
};
