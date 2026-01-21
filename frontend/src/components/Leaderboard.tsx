import { Trophy, Medal, User } from 'lucide-react';

export function Leaderboard() {
    // Mock data
    const leaders = [
        { rank: 1, name: '0xWhale...42', score: 12500, yield: '12%', status: 'active' },
        { rank: 2, name: 'YieldKing', score: 9800, yield: '11%', status: 'active' },
        { rank: 3, name: 'Satoshi_Fan', score: 8500, yield: '10.5%', status: 'idle' },
        { rank: 4, name: 'You', score: 2400, yield: '5.2%', status: 'active' },
        { rank: 5, name: 'Degen007', score: 1200, yield: '4.8%', status: 'idle' },
    ];

    return (
        <div className="glass-panel p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Trophy className="text-yellow-400" /> Leaderboard
                </h3>
                <span className="text-xs text-gray-400">Global Rank</span>
            </div>

            <div className="space-y-3">
                {leaders.map((leader) => (
                    <div
                        key={leader.rank}
                        className={`flex items-center justify-between p-3 rounded-xl border ${leader.name === 'You' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/5'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                                ${leader.rank === 1 ? 'bg-yellow-400/20 text-yellow-400' :
                                    leader.rank === 2 ? 'bg-gray-300/20 text-gray-300' :
                                        leader.rank === 3 ? 'bg-amber-600/20 text-amber-600' : 'bg-gray-800 text-gray-500'}
                            `}>
                                {leader.rank <= 3 ? <Medal size={16} /> : leader.rank}
                            </div>
                            <div>
                                <div className={`font-medium text-sm flex items-center gap-2 ${leader.name === 'You' ? 'text-purple-300' : 'text-white'}`}>
                                    {leader.name} {leader.name === 'You' && <User size={12} />}
                                </div>
                                <div className="text-xs text-gray-500">Yield: {leader.yield} APY</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-white font-mono font-semibold">{leader.score.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">CMD</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
