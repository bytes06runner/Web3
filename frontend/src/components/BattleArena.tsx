// @ts-nocheck
import { useState, useEffect } from 'react';
import { Sword, Shield, RefreshCw } from 'lucide-react';
import { MockContract } from '../services/mockContract';
import { BattleInterface } from './BattleInterface';
import { StellarService } from '../services/stellarService';

interface BattleArenaProps {
    refreshGame: () => void;
    onToast?: (type: 'success' | 'error', msg: string) => void;
    walletAddress: string | null;
    user: any;
    xlmBalance: string;
}

export function BattleArena({ refreshGame, onToast, walletAddress, user, xlmBalance }: BattleArenaProps) {
    const [opponents, setOpponents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOpponent, setSelectedOpponent] = useState<any>(null);
    const [raiding, setRaiding] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [battleResult, setBattleResult] = useState<any>(null);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        fetchOpponents();
    }, []);
    useEffect(() => {
        const checkCooldown = () => {
            const state = MockContract.getState();
            if (state.cooldownUntil && state.cooldownUntil > Date.now()) {
                setCooldown(Math.ceil((state.cooldownUntil - Date.now()) / 1000));
            } else {
                setCooldown(0);
            }
        };
        checkCooldown();
        const interval = setInterval(checkCooldown, 1000);
        return () => clearInterval(interval);
    }, [raiding, modalOpen]); // Check when raid finishes or modal opens


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
        setLogs(["ready_for_deployment..."]);
        setBattleResult(null);
        setModalOpen(true);
    };

    
    const handleSkipCooldown = async () => {
        if (!walletAddress) {
            onToast?.('error', 'Connect Wallet to Skip');
            return;
        }
        try {
            onToast?.('info', 'Signing Skip Transaction...');
            await StellarService.deposit(walletAddress, "5"); // 5 XLM Cost
            MockContract.skipCooldown();
            setCooldown(0);
            onToast?.('success', 'Cooldown Skipped!');
        } catch (e: any) {
            onToast?.('error', 'Payment Failed');
        }
    };

        const handleLaunch = async () => {
        if (!selectedOpponent) return;
        
        // V3 Staking Check
        if (!walletAddress) {
            onToast?.('error', 'Connect Wallet to Stake');
            return;
        }
        
        // Calculate Logic for Pre-Check (Visual only)
        const dps = ((user?.troops?.archers||0)*3) + ((user?.troops?.infantry||0)*5) + ((user?.troops?.giants||0)*7);
        const def = selectedOpponent.stats?.defense || 50;
        
        if (dps <= def) {
             // Optional Warning
             // onToast('error', 'Commander! Our DPS is too low to breach!');
             // We can let them fail if they want to lose 100 XLM... 
        }

        setRaiding(true);
        setLogs([]); 

        const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

        addLog("🔗 INITIATING SECURE STAKE PROTOCOL...");
        
        try {
            // 1. Stake
            await StellarService.deposit(walletAddress, "100");
            addLog("💰 STAKE LOCKED: 100 XLM");
            await new Promise(r => setTimeout(r, 800));
            
            addLog("🚀 LAUNCHING V3 ASSAULT UNITS...");
            addLog(`⚔️ TOTAL ARMY DPS: ${dps}`);
            await new Promise(r => setTimeout(r, 1000));

            // 2. Execute Raid Math
            const targetName = selectedOpponent.username || 'Unknown';
            const result = await MockContract.raid(targetName, walletAddress, 0, selectedOpponent.stats);

            if (result.success) {
                 addLog("✅ DEFENSE PENETRATED!");
                 addLog(`💥 DESTRUCTION: ${result.destruction.toFixed(1)}%`);
                 addLog(`💸 PAYOUT: ${result.reward} XLM`);
            } else {
                 addLog("🛡️ ATTACK REPELLED.");
                 addLog("⚠️ STAKE LIQUIDATED.");
            }
            
            setBattleResult(result);
            // Wait a moment before refreshing to show results
            await new Promise(r => setTimeout(r, 1000));
            refreshGame(); 
            
        } catch (e: any) {
            addLog(`❌ RAID ABORTED: ${e.message}`);
        } finally {
            setRaiding(false);
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
                        <div className="text-center text-gray-500 py-4">No opponents found.</div>
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
                                onClick={() => cooldown > 0 ? handleSkipCooldown() : initiateRaid(opp)}
                                disabled={raiding || (user?.username === opp.username) }
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >{cooldown > 0 ? `⚡ SKIP (${cooldown}s) - 5 XLM` : "BATTLE"}</button>
                        </div>
                    ))}
                </div>
            </div>

            {selectedOpponent && (
                <BattleInterface 
                    isOpen={modalOpen}
                    balance={xlmBalance}
                    topCommanders={opponents} 
                    onClose={() => setModalOpen(false)}
                    onLaunch={handleLaunch}
                    isRaiding={raiding}
                    attacker={{ name: user?.username || 'YOU', power: 100, unit: 'CYBER_UNIT' }}
                    defender={{ 
                        name: selectedOpponent.username, 
                        defense: selectedOpponent.stats?.defense || 50, 
                        unit: 'FORTRESS_V1' 
                    }}
                    logs={logs}
                    result={battleResult}
                />
            )}
        </>
    );
}
