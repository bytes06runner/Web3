import { useState, useEffect } from 'react';
import { Sword, Users, Shield, RefreshCw } from 'lucide-react';
import { MockContract } from '../services/mockContract';
import { BreachTerminal } from './BreachTerminal';

interface BattleArenaProps {
    refreshGame: () => void;
    onToast?: (type: 'success' | 'error', msg: string) => void;
    walletAddress: string | null;
    user: any;
}

export function BattleArena({ refreshGame, onToast, walletAddress, user }: BattleArenaProps) {
    const [opponents, setOpponents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOpponent, setSelectedOpponent] = useState<any>(null);
    const [raiding, setRaiding] = useState(false);

    useEffect(() => {
        fetchOpponents();
    }, []);

    const fetchOpponents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setOpponents(data.slice(0, 5));
            } else {
                 setOpponents([
                     { username: 'Satoshi_Vault (Offline)', stats: { defense: 80, wins: 12 } },
                ]);
            }
        } catch (e) {
            console.error("Failed to fetch opponents", e);
        } finally {
            setLoading(false);
        }
    };

    const initiateRaid = (opponent: any) => {
        if (!walletAddress) {
            onToast?.('error', 'Connect Wallet to Raid');
            return;
        }
        setSelectedOpponent(opponent);
        setModalOpen(true);
    };

    const executeRaid = async () => {
        setModalOpen(false);
        if (!selectedOpponent) return;
        
        setRaiding(true);
        try {
            const targetName = selectedOpponent.username || 'Unknown';
            const result = await MockContract.raid(targetName, walletAddress!);

            // Update Backend Stats
            try {
                await fetch('/api/update_stats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        attackerWallet: walletAddress,
                        defenderUsername: targetName,
                        success: result.success
                    })
                });
            } catch (err) {
                console.error("Failed to sync stats", err);
            }

            refreshGame(); 

            if (result.success) {
                onToast?.('success', `Raid Successful! (${result.destruction}% Dmg) +${result.reward} XLM`);
            } else {
                const phaseInfo = result.phase === 'Breach' ? 'Wall Blocked' : 'Ambush failed';
                onToast?.('error', `Raid Failed (${phaseInfo}). Penalty: ${(result as any).penalty || 0} XLM.`);
            }
        } catch (e: any) {
            onToast?.('error', e.message || 'Raid Failed');
        } finally {
            setRaiding(false);
            setSelectedOpponent(null);
        }
    };

    return (
        <>
            <div className="glass-panel p-6 rounded-2xl relative">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sword className="text-red-500" /> Battle Arena
                    </h3>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchOpponents} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <RefreshCw size={14} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full border border-red-500/30 animate-pulse">
                            PvP Active
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    {opponents.length === 0 && !loading && (
                        <div className="text-center text-gray-500 py-4">No opponents found in range.</div>
                    )}
                    
                    {opponents.map((opp) => (
                        <div key={opp._id || opp.username} className="group bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 hover:border-red-500/30 transition-all flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10 text-xs font-bold text-white">
                                    {(opp.username || '?').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-white font-medium text-sm">{opp.username}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                        <span className="flex items-center gap-1"><Shield size={10} /> {opp.stats?.defense || 0}</span>
                                        <span className="text-green-500 font-mono text-[10px] ml-2">WIN:{opp.stats?.wins || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => initiateRaid(opp)}
                                disabled={raiding}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {raiding && selectedOpponent?.username === opp.username ? 'Raiding...' : 'RAID'}
                            </button>
                        </div>
                    ))}
                </div>
                
                 <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 flex items-start gap-2">
                    <Users size={16} className="text-blue-400 mt-1" />
                    <div className="text-xs text-blue-200">
                        <strong>Alliance Tip:</strong> Form an alliance to boost your defense by 50%. (Coming soon)
                    </div>
                </div>
            </div>

            {selectedOpponent && (
                <BreachTerminal 
                    isOpen={modalOpen} 
                    onClose={() => setModalOpen(false)}
                    onBreach={executeRaid}
                    attackerStats={user?.stats}
                    opponent={selectedOpponent}
                />
            )}
        </>
    );
}
