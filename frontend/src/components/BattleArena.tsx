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
            await delay(2000); 

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
            
            const targetName = selectedOpponent.username || 'Unknown';
            const result = await MockContract.raid(targetName, walletAddress, 0, selectedOpponent.stats);

            addLog("🏰 TOWNHALL SACKED! BASE DESTROYED.");
            addLog(`💥 TOTAL DESTRUCTION: ${result.destruction.toFixed(0)}%`);
            
            // Double or Nothing Logic
            if (result.success) {
                 addLog(`💰 WINNER PAYOUT: 200 XLM (2x STAKE)`); // Hardcoded visualization match
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
            <div className="parchment-scroll h-96 p-8 pt-16 pb-12 relative filter drop-shadow-xl flex flex-col">
                 <div className="flex items-center justify-between mb-4 border-b border-amber-900/20 pb-2">
                    <h3 className="font-game text-amber-900 text-xl flex items-center gap-2">
                        Battle Arena
                    </h3>
                    <button onClick={fetchOpponents} className="p-1 hover:bg-amber-900/10 rounded-full transition-colors">
                        <RefreshCw size={14} className={`text-amber-800 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {opponents.length === 0 && !loading && (
                        <div className="text-center text-amber-900/50 py-4 italic">No targets found.</div>
                    )}
                    
                    {opponents.map((opp) => (
                        <div key={opp._id || opp.username} className="group flex items-center justify-between border-b border-dashed border-amber-900/30 pb-2 last:border-0 hover:bg-amber-900/5 p-2 rounded">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-[#8d6e63] flex items-center justify-center text-white font-bold text-xs ring-2 ring-[#3e2723]">
                                    {(opp.username || '?').substring(0, 1).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-amber-900 font-bold text-sm leading-none">{opp.username}</div>
                                    <div className="text-[10px] text-amber-800/70 font-mono">
                                        DEF: {opp.stats?.defense || 0}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => cooldown > 0 ? handleSkipCooldown() : initiateRaid(opp)}
                                disabled={raiding || (user?.username === opp.username) }
                                className={`
                                    ${cooldown > 0 ? 'bg-amber-700 text-white rounded px-2 py-1 text-xs' : 'btn-stake w-24 h-12'}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    flex items-center justify-center font-game text-white text-xs drop-shadow-md
                                `}
                            >
                                {cooldown > 0 ? `SKIP ${cooldown}s` : ''} 
                                {/* If btn-stake has text, leave empty. Assuming it has "STAKE". */}
                            </button>
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
