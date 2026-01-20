import { Shield, Coins, TrendingUp, Activity } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface DashboardProps {
    principal: number;
    commandTokens: number;
    yieldEarned: number;
    defense: number;
    className?: string;
}

export function Dashboard({ principal, commandTokens, yieldEarned, defense, className }: DashboardProps) {
    return (
        <div className={twMerge("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
            {/* Main Stats Card */}
            <div className="glass-panel p-6 rounded-2xl md:col-span-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Shield size={120} />
                </div>
                <h2 className="text-gray-400 text-sm font-semibold tracking-wider uppercase mb-1">Total Value Locked</h2>
                <div className="text-4xl font-bold text-white mb-2 flex items-baseline gap-2">
                    ${principal.toFixed(2)}
                    <span className="text-sm font-normal text-green-400 flex items-center gap-1">
                        <TrendingUp size={14} /> +5% APY
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                            <Coins size={12} /> Yield Earned
                        </div>
                        <div className="text-xl font-semibold text-green-300">${yieldEarned.toFixed(4)}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                            <Activity size={12} /> Command
                        </div>
                        <div className="text-xl font-semibold text-blue-300 neon-text">{Math.floor(commandTokens)} CMD</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                            <Shield size={12} /> Defense
                        </div>
                        <div className="text-xl font-semibold text-purple-300">{defense}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
