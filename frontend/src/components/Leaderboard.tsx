import { useEffect, useState } from 'react';
import { Trophy, Crown, RefreshCw } from 'lucide-react';

export function Leaderboard() {
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
        // Poll for updates every 10 seconds
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch from REAL MongoDB via Netlify Functions
            const response = await fetch('/api/users');
            if (response.ok) {
                const users = await response.json();
                // Format for leaderboard display
                const formatted = users.map((user: any, index: number) => ({
                    rank: index + 1,
                    username: user.username,
                    score: user.stats?.wins || 0,
                    wallet: user.walletAddress?.substring(0, 8) + '...'
                }));
                setPlayers(formatted);
            }
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-sm mx-auto animate-in zoom-in duration-500">
            <div className="gold-frame p-[14%] pb-[16%] drop-shadow-2xl filter brightness-110">
                
                {/* Header */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Crown className="text-yellow-400 drop-shadow-md animate-pulse" size={24} />
                    <h2 className="font-game text-xl text-[#fbbf24] tracking-widest text-stroke uppercase">Leaderboard</h2>
                    <button onClick={loadData} className="ml-2 p-1 hover:bg-white/10 rounded-full">
                        <RefreshCw size={14} className={`text-yellow-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* List */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                    {players.length === 0 && !loading && (
                        <div className="text-center text-yellow-600/50 py-4 text-sm">No warriors yet...</div>
                    )}
                    {players.map((player) => (
                        <div key={player.rank} className={`flex items-center justify-between p-2 rounded border-b border-[#ffffff10] ${player.rank === 1 ? 'bg-yellow-500/20' : 'hover:bg-white/5'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 flex items-center justify-center font-bold font-mono rounded-full text-xs
                                    ${player.rank === 1 ? 'bg-yellow-500 text-black shadow-lg scale-110' : 
                                      player.rank === 2 ? 'bg-gray-400 text-black' : 
                                      player.rank === 3 ? 'bg-orange-700 text-white' : 'bg-[#222] text-gray-500'}
                                `}>
                                    {player.rank}
                                </div>
                                <span className={`font-bold text-sm ${player.rank === 1 ? 'text-yellow-300' : 'text-gray-200'}`}>
                                    {player.username}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500 font-mono font-bold text-sm">
                                <Trophy size={12} />
                                {player.score}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-4">
                    <p className="text-[10px] text-yellow-600/60 uppercase tracking-widest font-bold">Live from MongoDB</p>
                </div>
            </div>
        </div>
    );
}
