import { Shield, TrendingUp, Activity, Flame } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface DashboardProps {
    balance: number;
    capacity: number;
    commandTokens: number;
    yieldEarned: number;
    defense: number;
    stamina: number;
    streakDays: number;
    className?: string;
}

export function Dashboard({ balance, capacity, defense, stamina, streakDays, className }: DashboardProps) {
    const healthPercent = Math.min(capacity, 100);
    const powerLevel = defense + (stamina / 2) + (streakDays * 5);
    
    // Power Intensity Glow Color
    const glowColor = powerLevel > 200 ? 'shadow-cyan-500/50' : powerLevel > 100 ? 'shadow-blue-500/50' : 'shadow-slate-500/50';
    const borderColor = powerLevel > 200 ? 'border-cyan-500' : powerLevel > 100 ? 'border-blue-500' : 'border-slate-500';

    return (
        <div className={twMerge("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
            {/* Main Stats Card (Cyber-Noir Style) */}
            <div className={`glass-panel p-6 rounded-2xl md:col-span-2 relative overflow-hidden group border ${borderColor} shadow-lg ${glowColor} transition-all duration-500`}>
                
                {/* Background Grid Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none"></div>

                <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-50 transition-opacity">
                    <Shield size={120} className="text-cyan-900" />
                </div>
                
                <h2 className="text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase mb-1">Vault Status // Online</h2>
                <div className="text-5xl font-bold text-white mb-2 flex items-baseline gap-2 font-mono">
                    ${balance.toFixed(2)}
                    <span className="text-xs font-normal text-green-400 flex items-center gap-1 bg-green-900/20 px-2 py-1 rounded border border-green-900/50">
                        <TrendingUp size={10} /> +5% APY
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8">
                    {/* Liquid Fill Gauge (Visual Simulation) */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-900/50 to-cyan-500/20 transition-all duration-1000" style={{ height: `${healthPercent}%` }}></div>
                        <div className="relative z-10">
                            <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Activity size={10} /> Capacity
                            </div>
                            <div className="text-2xl font-bold text-cyan-200 font-mono">{Math.floor(healthPercent)}%</div>
                            <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${healthPercent}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Shield size={10} /> Defense Integrity
                        </div>
                        <div className="text-2xl font-bold text-purple-300 font-mono">{defense}</div>
                    </div>
                    
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Flame size={10} className="text-crimson-500" /> Hazard Streak
                        </div>
                        <div className="text-2xl font-bold text-white font-mono flex items-center gap-1">
                            {streakDays} <span className="text-[10px] text-slate-600 font-normal">CYCLES</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
