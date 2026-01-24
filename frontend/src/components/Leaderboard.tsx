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
        <div className="h-96 flex flex-col items-center justify-center relative">
            {/* Gold Frame Background */}
            <div className="gold-frame absolute inset-0 z-0 pointer-events-none drop-shadow-2xl"></div>

            <div className="relative z-10 w-full h-full p-12 pr-12 pl-12 flex flex-col items-center text-center pt-20 pb-20">
                <div className="flex items-center gap-2 mb-4 bg-black/40 px-4 py-1 rounded-full border border-yellow-500/30">
                     <Crown size={20} className="text-yellow-400" />
                     <h3 className="font-game text-yellow-100 uppercase tracking-widest text-lg">Leaderboard</h3>
                </div>

                <div className="w-full space-y-2 overflow-hidden">
                    {leaders.map((l, i) => (
                        <div key={i} className="flex justify-between items-center text-sm px-4 py-2 bg-black/20 rounded border border-yellow-900/10">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold font-mono ${i===0?'text-yellow-300':i===1?'text-slate-300':'text-amber-700'}`}>#{i+1}</span>
                                <span className="text-amber-900 font-bold drop-shadow-sm text-shadow-white">{l.username}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Trophy size={12} className="text-yellow-600" />
                                <span className="text-amber-900 font-mono font-bold">{l.stats?.wins || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
