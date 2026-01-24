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
        <div className="h-[450px] flex flex-col items-center justify-center relative">
            {/* Gold Frame Background */}
            <div className="gold-frame absolute inset-0 z-0 pointer-events-none drop-shadow-2xl"></div>

            {/* Dark Backdrop for Readability */}
            <div className="absolute inset-x-12 inset-y-16 bg-[#1a1a1a]/80 backdrop-blur-sm z-0 rounded-lg"></div>

            <div className="relative z-10 w-full h-full p-16 flex flex-col items-center text-center pt-24 pb-20">
                <div className="flex items-center gap-2 mb-6 bg-black/80 px-6 py-1.5 rounded-full border border-yellow-500/50 shadow-lg">
                     <Crown size={20} className="text-yellow-400" />
                     <h3 className="font-game text-yellow-100 uppercase tracking-widest text-lg">Leaderboard</h3>
                </div>

                <div className="w-full space-y-3 overflow-hidden">
                    {leaders.map((l, i) => (
                        <div key={i} className="flex justify-between items-center text-sm px-4 py-2.5 bg-black/40 rounded border border-yellow-500/10 hover:bg-black/60 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className={`font-bold font-mono text-lg ${i===0?'text-yellow-400 drop-shadow-md':i===1?'text-slate-300':'text-amber-600'}`}>#{i+1}</span>
                                <span className="text-gray-200 font-bold tracking-wide">{l.username}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-yellow-900/20 px-2 py-0.5 rounded text-yellow-500">
                                <Trophy size={12} />
                                <span className="font-mono font-bold">{l.stats?.wins || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
