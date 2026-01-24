import { Trophy, Crown, Medal } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Leaderboard() {
    const [leaders, setLeaders] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a: any, b: any) => (b.stats?.wins || 0) - (a.stats?.wins || 0));
                setLeaders(sorted.slice(0, 5));
            })
            .catch(() => setLeaders([
                { username: 'Mamatar Panty', stats: { wins: 400 } },
                { username: 'Sanjeet', stats: { wins: 30 } }
            ]));
    }, []);

    return (
        <div className="relative w-full aspect-[4/5] max-h-[500px] flex flex-col items-center justify-center p-[15%]">
            {/* Gold Frame Background */}
            <div className="gold-frame absolute inset-0 z-0 pointer-events-none drop-shadow-2xl"></div>

            {/* Dark Backdrop for Readability - Inset optimized for the frame asset */}
            <div className="absolute inset-[15%] bg-[#121212]/90 backdrop-blur-sm z-0 rounded-xl border border-yellow-900/30"></div>

            <div className="relative z-10 w-full h-full flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-4 bg-black/80 px-4 py-1 rounded-full border border-yellow-500/50 shadow-lg mt-2">
                     <Crown size={16} className="text-yellow-400" />
                     <h3 className="font-game text-yellow-100 uppercase tracking-widest text-sm md:text-base">Leaderboard</h3>
                </div>

                <div className="w-full space-y-2 overflow-hidden flex-1 relative">
                    {leaders.map((l, i) => (
                        <div key={i} className="flex justify-between items-center text-xs md:text-sm px-3 py-2 bg-white/5 rounded border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold font-mono ${i===0?'text-yellow-400':i===1?'text-slate-300':'text-amber-700'}`}>#{i+1}</span>
                                <span className="text-gray-200 font-bold tracking-wide truncate max-w-[100px]">{l.username}</span>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500/80">
                                <Trophy size={10} />
                                <span className="font-mono font-bold">{l.stats?.wins || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
