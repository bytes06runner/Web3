import { useState } from 'react';
import { Sword, Users, Shield } from 'lucide-react';
import { MockContract } from '../services/mockContract';

interface BattleArenaProps {
    refreshGame: () => void;
    onToast?: (type: 'success' | 'error', msg: string) => void;
    walletAddress: string | null;
}

const MOCK_OPPONENTS = [
    { name: 'Satoshi_Vault', defense: 80, yield: 450, risk: 'Low' },
    { name: 'Gwei_Hunter', defense: 120, yield: 1200, risk: 'Medium' },
    { name: 'Degen_King', defense: 200, yield: 5000, risk: 'High' },
];

export function BattleArena({ refreshGame, onToast, walletAddress }: BattleArenaProps) {
    const [attacking, setAttacking] = useState<string | null>(null);

    const handleRaid = async (target: string) => {
        if (!walletAddress) {
            onToast?.('error', 'Connect Wallet to Raid');
            return;
        }

        setAttacking(target);
        
        try {
            // Updated raid involves tx signing which takes time
            const result = await MockContract.raid(target, walletAddress);
            refreshGame(); 

            if (result.success) {
                onToast?.('success', `Raid Successful! +${result.reward} XLM`);
            } else {
                onToast?.('error', `Raid Failed. Wallet deducted ${result.penalty} XLM.`);
            }

        } catch (e: any) {
            onToast?.('error', e.message || 'Transaction / Raid Failed');
        } finally {
            setAttacking(null);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sword className="text-red-500" /> Battle Arena
                </h3>
                <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full border border-red-500/30 animate-pulse">
                    PvP Active
                </span>
            </div>

            <div className="space-y-3">
                {MOCK_OPPONENTS.map((opp) => (
                    <div key={opp.name} className="group bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 hover:border-red-500/30 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10 text-xs font-bold text-white">
                                {opp.name.substring(0, 2)}
                            </div>
                            <div>
                                <div className="text-white font-medium text-sm">{opp.name}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                    <span className="flex items-center gap-1"><Shield size={10} /> {opp.defense}</span>
                                    <span className="text-green-500">Est. Loot: ${Math.floor(opp.yield * 0.2)}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleRaid(opp.name)}
                            disabled={!!attacking}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {attacking === opp.name ? 'Raiding...' : 'RAID (10 CMD + 20 STM)'}
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
    );
}
