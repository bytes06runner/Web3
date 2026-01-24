import { useEffect, useState } from 'react';
import { Trophy, Medal, User } from 'lucide-react';

export function Leaderboard() {
    const [leaders, setLeaders] = useState<any[]>([]);

    useEffect(() => {
        const fetchLeaders = async () => {
             try {
                 const res = await fetch('/api/users');
                 if (res.ok) {
                     const data = await res.json();
                     // Sort by wins
                     const sorted = data.sort((a: any, b: any) => (b.stats?.wins || 0) - (a.stats?.wins || 0));
                     setLeaders(sorted.slice(0, 10)); 
                 }
             } catch (e) {
                 console.error("Failed to fetch leaderboard", e);
             }
        };
        fetchLeaders();
    }, []);

    return (
        <div className="glass-panel p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Trophy className="text-yellow-400" /> Leaderboard
                </h3>
                <span className="text-xs text-gray-400">Top Commanders</span>
            </div>

            <div className="space-y-3">
                {leaders.length === 0 && <div className="text-gray-500 text-sm text-center">Loading System Data...</div>}
                
                {leaders.map((leader, index) => {
                    const rank = index + 1;
                    // Identify if this is the current user (simple check if we had user context, omitting for now or assuming username match if prop passed)
                    const isMe = false; 
                    
                    return (
                    <div
                        key={leader._id || index}
                        className={`flex items-center justify-between p-3 rounded-xl border ${isMe ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/5'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                                ${rank === 1 ? 'bg-yellow-400/20 text-yellow-400' :
                                    rank === 2 ? 'bg-gray-300/20 text-gray-300' :
                                        rank === 3 ? 'bg-amber-600/20 text-amber-600' : 'bg-gray-800 text-gray-500'}
                            `}>
                                {rank <= 3 ? <Medal size={16} /> : rank}
                            </div>
                            <div>
                                <div className={`font-medium text-sm flex items-center gap-2 ${isMe ? 'text-purple-300' : 'text-white'}`}>
                                    {leader.username} {isMe && <User size={12} />}
                                </div>
                                <div className="text-xs text-gray-500">Def: {leader.stats?.defense || 0}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-white font-mono font-semibold">{leader.stats?.wins || 0}</div>
                            <div className="text-xs text-gray-500">WINS</div>
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}
