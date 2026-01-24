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
        <div className="w-full relative z-50 mb-4 pt-4 px-2 md:px-0">
            {/* Wood Banner Background */}
            <div className="wood-banner max-w-5xl mx-auto h-24 md:h-32 flex items-center justify-between px-6 md:px-14 relative drop-shadow-2xl">
                
                {/* Left: Stellar Balance Chest */}
                <div className="flex items-center gap-3 relative -top-2">
                    <div className="chest-gold w-16 h-14 md:w-20 md:h-16 animate-bounce-slow"></div>
                    <div className="flex flex-col">
                        <span className="text-amber-200 text-[10px] md:text-xs font-bold uppercase tracking-widest text-shadow-sm">Stellar Balance</span>
                        <span className="font-game text-white text-lg md:text-2xl drop-shadow-md text-stroke">{balance} XLM</span>
                    </div>
                </div>

                {/* Center: Title (Mobile Hidden or Small) */}
                <div className="absolute left-1/2 -translate-x-1/2 top-4 hidden md:block">
                     <h1 className="font-game text-3xl text-amber-400 tracking-wider text-stroke drop-shadow-lg">YIELD RAIDERS</h1>
                </div>

                {/* Right: Vault Status Chest */}
                <div className="flex items-center gap-3 relative -top-2 text-right">
                    <div className="flex flex-col items-end">
                        <span className="text-purple-200 text-[10px] md:text-xs font-bold uppercase tracking-widest text-shadow-sm">Vault Status</span>
                         <span className="font-game text-green-400 text-lg md:text-2xl drop-shadow-md text-stroke">{apy}</span>
                    </div>
                    <div className="chest-elixir w-16 h-14 md:w-20 md:h-16 animate-pulse-slow"></div>
                </div>

                {/* Logout / Wallet (Absolute Positioning on Banner Edge?) No, let's keep them accessible */}
            </div>
            
            {/* Floating Action Buttons (Outside Banner) */}
            <div className="max-w-5xl mx-auto flex justify-between px-4 -mt-2">
                 <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-gray-300">
                    CMD: <span className="text-white">{username}</span>
                 </div>
                 <div className="flex gap-2">
                    {!walletAddress ? (
                        <button onClick={onConnect} className="bg-blue-600/80 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2 border border-blue-400">
                            <Wifi size={12} /> Connect Wallet
                        </button>
                    ) : (
                        <button onClick={onLogout} className="bg-red-500/20 hover:bg-red-500/40 text-red-300 text-xs px-3 py-1 rounded-full flex items-center gap-2 border border-red-500/30">
                            <LogOut size={12} /> Logout
                        </button>
                    )}
                 </div>
            </div>
        </div>
    );
};
