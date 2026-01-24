import { Shield, Flame, Activity } from 'lucide-react';

interface DashboardProps {
    capacity: number;
    defense: number;
    streakDays: number;
    className?: string;
}

export function Dashboard({ capacity, defense, streakDays, className }: DashboardProps) {
    // Capacity is "Available Space" passed from App (100 - used)
    // If we want "Used" logic visually, we can invert if needed, but "Capacity" usually means what you have. 
    // Concepts: "Capacity Bar" -> Empty to Full? or Full to Empty? 
    // User ref: "This capacity will reduce as we train troops". So it's "Available Capacity".
    // 100% = Full Empty Space? Or 100% = Full Troops?
    // User said: "Starts at 100% (Empty Garrison). As you train troops... meter reduces."
    // So value passed is % Available.
    
    return (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 ${className}`}>
            {/* Capacity Status */}
            <div className="bg-black/40 border-2 border-slate-600 rounded-xl p-3 relative overflow-hidden backdrop-blur-sm">
                 <div className="flex items-center gap-2 mb-2 z-10 relative">
                    <div className="p-1 bg-cyan-500/20 rounded">
                        <Activity size={16} className="text-cyan-400" />
                    </div>
                    <span className="font-game text-cyan-100 text-sm uppercase tracking-wider">Capacity</span>
                 </div>
                 <div className="relative h-6 bg-slate-800 rounded-full border border-slate-600 overflow-hidden shadow-inner">
                    <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000"
                        style={{ width: `${capacity}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md z-10">
                        {capacity}% AVAILABLE
                    </div>
                 </div>
            </div>

            {/* Defense Integrity */}
            <div className="bg-black/40 border-2 border-slate-600 rounded-xl p-3 relative overflow-hidden backdrop-blur-sm">
                 <div className="flex items-center gap-2 mb-2 z-10 relative">
                    <div className="p-1 bg-purple-500/20 rounded">
                        <Shield size={16} className="text-purple-400" />
                    </div>
                    <span className="font-game text-purple-100 text-sm uppercase tracking-wider">Defense Integrity</span>
                 </div>
                 <div className="relative h-6 bg-slate-800 rounded-full border border-slate-600 overflow-hidden shadow-inner">
                    <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-1000"
                        style={{ width: `${Math.min(defense, 100)}%` }} // Assuming 100 is max visible scale
                    ></div>
                     <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md z-10">
                        {defense} HP
                    </div>
                 </div>
            </div>

            {/* Hazard Streak */}
            <div className="bg-black/40 border-2 border-slate-600 rounded-xl p-3 relative overflow-hidden backdrop-blur-sm">
                 <div className="flex items-center gap-2 mb-2 z-10 relative">
                    <div className="p-1 bg-red-500/20 rounded">
                        <Flame size={16} className="text-red-400" />
                    </div>
                    <span className="font-game text-red-100 text-sm uppercase tracking-wider">Hazard Streak</span>
                 </div>
                 <div className="relative h-6 bg-slate-800 rounded-full border border-slate-600 overflow-hidden shadow-inner flex items-center px-4">
                    <div className="text-white font-game text-sm flex-1 text-center">
                        {streakDays} <span className="text-slate-400 text-[10px]">CYCLES</span>
                    </div>
                 </div>
            </div>
        </div>
    );
}
