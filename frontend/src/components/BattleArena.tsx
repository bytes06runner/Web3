// @ts-nocheck
import { useState, useEffect } from 'react';
import { Sword, Shield, RefreshCw } from 'lucide-react';
import { MockContract } from '../services/mockContract';
import { BattleInterface } from './BattleInterface';
import { StellarService } from '../services/stellarService';

interface BattleArenaProps {
    refreshGame: () => void;
    onToast?: (type: 'success' | 'error' | 'info', msg: string) => void;
    walletAddress: string | null;
    user: any;
    xlmBalance: string;
    troops: any;
}

export function BattleArena({ refreshGame, onToast, walletAddress, user, xlmBalance, troops }: BattleArenaProps) {
    const [opponents, setOpponents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOpponent, setSelectedOpponent] = useState<any>(null);
    const [raiding, setRaiding] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [battleResult, setBattleResult] = useState<any>(null);
    const [cooldown, setCooldown] = useState(0);
    const currentDps = ((troops?.archers||0)*3) + ((troops?.infantry||0)*5) + ((troops?.giants||0)*7);

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
    }, [raiding, modalOpen]); 

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
            await StellarService.deposit(walletAddress, "5"); 
            MockContract.skipCooldown();
            setCooldown(0);
            onToast?.('success', 'Cooldown Skipped!');
        } catch (e: any) {
            onToast?.('error', 'Payment Failed');
        }
    };

    const handleLaunch = async () => {
        if (!selectedOpponent) return;
        
        if (!walletAddress) {
            onToast?.('error', 'Connect Wallet to Stake');
            return;
        }
        
        const dps = currentDps;
        const def = selectedOpponent.stats?.defense || 50;
        
        if (dps === 0) {
             onToast?.('error', 'Recruit troops first! DPS is 0.');
             return;
        }

        setRaiding(true);
        setLogs([]); 
        setBattleResult(null);

        const addLog = (msg: string) => setLogs(prev => [...prev, msg]);
        const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

        addLog("🔗 INITIATING SECURE STAKE PROTOCOL...");
        
        try {
            await StellarService.deposit(walletAddress, "100");
            addLog("💰 STAKE LOCKED: 100 XLM");
            await delay(1000);
            
            // --- PHASE 1: THE WALL ---
            addLog("📡 PHASE 1: TARGETING WALL STRUCTURE...");
            await delay(1500);

            // Wall Check (Need 30% of Defense to Breach Wall)
            if (dps < def * 0.3) {
                 addLog("❌ WALL REFLECTED DAMAGE.");
                 addLog("⚠️ ATTACK FAILED AT PHASE 1.");
                 addLog("💸 STAKE LOST.");
                 setRaiding(false);
                 return;
            }
            addLog("💥 WALL BREACHED! DEFENSE INTEGRITY DROPPING...");
            
            // --- PHASE 2: THE ARMY ---
            await delay(1500);
            addLog("⚔️ PHASE 2: ENGAGING DEFENSE ARMY...");
            await delay(2000); // Suspense

            // Army Check (Need > Defense to Win fully)
            if (dps <= def) {
                 addLog("🛡️ ENEMY UNITS HELD THE LINE.");
                 addLog("❌ ARMY DEFEATED. RETREATING...");
                 addLog("💸 STAKE LOST.");
                 setRaiding(false);
                 return;
            }
            addLog("💀 DEFENSE ARMY ELIMINATED! PATH CLEAR.");

            // --- PHASE 3: TOWNHALL ---
            await delay(1500);
            addLog("🔥 PHASE 3: STORMING TOWNHALL...");
            await delay(1500);
            
            // Execute Contract Logic for Rewards
            const targetName = selectedOpponent.username || 'Unknown';
            const result = await MockContract.raid(targetName, walletAddress, 0, selectedOpponent.stats);

            addLog("🏰 TOWNHALL SACKED! BASE DESTROYED.");
            addLog(`💥 TOTAL DESTRUCTION: ${result.destruction.toFixed(0)}%`);
            addLog(`💸 PAYOUT: ${result.reward} XLM`);

            // Real Payout Trigger
            if (result.success) {
                 try {
                     addLog("🏦 TRANSFERRING REWARD FROM BANK...");
                     await StellarService.payoutToUser(walletAddress, result.reward.toString());
                     addLog("✅ FUNDS RECEIVED IN WALLET");
                 } catch (payoutError) {
                     console.error(payoutError);
                     addLog("⚠️ PAYOUT TX FAILED (Check Bank Balance)");
                 }
            }
            
            setBattleResult(result);
            await delay(2000);
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
                            >{cooldown > 0 ? `⚡ SKIP (${cooldown}s) - 5 XLM` : "STAKE 100 XLM"}</button>
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
                    attacker={{ name: user?.username || 'YOU', power: currentDps, unit: 'V3_ARMY' }}
                    defender={{ 
                        name: selectedOpponent.username, 
                        defense: selectedOpponent.stats?.defense || 50, 
                        unit: 'FORTRESS_V3' 
                    }}
                    logs={logs}
                    result={battleResult}
                />
            )}
        </>
    );
}
