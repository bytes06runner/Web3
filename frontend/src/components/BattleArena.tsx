import { useState, useEffect } from 'react';
import { RefreshCw, Wallet } from 'lucide-react';
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
    const [awaitingWallet, setAwaitingWallet] = useState(false);

    const currentDps = ((troops?.archers||0)*3) + ((troops?.infantry||0)*5) + ((troops?.giants||0)*7);

    useEffect(() => { fetchOpponents(); }, []);
    useEffect(() => {
        const checkCooldown = () => {
            const state = MockContract.getState();
            if (state.cooldownUntil && state.cooldownUntil > Date.now()) {
                setCooldown(Math.ceil((state.cooldownUntil - Date.now()) / 1000));
            } else { setCooldown(0); }
        };
        checkCooldown();
        const interval = setInterval(checkCooldown, 1000);
        return () => clearInterval(interval);
    }, [raiding, modalOpen]);

    // Fetch opponents from REAL MongoDB
    const fetchOpponents = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                const users = await response.json();
                // Filter out current user
                const filtered = users.filter((u: any) => u.username !== user?.username).slice(0, 5);
                setOpponents(filtered.length > 0 ? filtered : [{ username: 'Training_Dummy', stats: { defense: 50 } }]);
            } else {
                setOpponents([{ username: 'Training_Dummy', stats: { defense: 50 } }]);
            }
        } catch (e) {
            console.error(e);
            setOpponents([{ username: 'Training_Dummy', stats: { defense: 50 } }]);
        } finally {
            setLoading(false);
        }
    };

    const initiateRaid = (opponent: any) => {
        if (!walletAddress) { onToast?.('error', 'Connect Wallet to Raid'); return; }
        setSelectedOpponent(opponent);
        setLogs([]);
        setBattleResult(null);
        setModalOpen(true);
        setAwaitingWallet(false);
    };

    const triggerRealTransaction = async () => {
        if (!walletAddress) return;
        if (parseFloat(xlmBalance || '0') < 100) {
            onToast?.('error', 'Insufficient Balance! Need 100 XLM.');
            return;
        }

        try {
            setAwaitingWallet(true);
            onToast?.('info', 'Please sign the transaction in Freighter...');
            
            const txHash = await StellarService.stakeRaid(walletAddress);
            
            if (txHash) {
                onToast?.('success', 'Stake Confirmed on Ledger!');
                setAwaitingWallet(false);
                executeRaidLogic(); 
            }
        } catch (error: any) {
            console.error("Raid Stake Error:", error);
            setAwaitingWallet(false);
            if (error.message?.includes('cancelled')) {
                onToast?.('info', 'Transaction Cancelled');
            } else {
                onToast?.('error', 'Stake Transaction Failed.');
            }
        }
    };

    const executeRaidLogic = async () => {
        setRaiding(true);
        setLogs(['✅ STAKE CONFIRMED (100 XLM)', 'initiating_handshake...', 'connecting_to_node...']);
        MockContract.deposit(-100); 
        refreshGame();

        setTimeout(async () => {
            try {
                const result = await MockContract.raid(
                    selectedOpponent?.username || 'Target',
                    walletAddress || '0x',
                    0, 
                    { defense: selectedOpponent?.stats?.defense || 50 }
                );

                const logLines = result.log.split('\n');
                let currentLine = 0;
                const interval = setInterval(async () => {
                    if (currentLine >= logLines.length) {
                        clearInterval(interval);
                        setBattleResult(result);
                        setRaiding(false);
                        
                        // SYNC WITH MONGODB BACKEND
                        try {
                            await fetch('/api/update_stats', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    username: user?.username,
                                    action: result.success ? 'win' : 'loss',
                                    amount: result.success ? 200 : 100
                                })
                            });
                        } catch (e) { console.error('Failed to sync stats:', e); }

                        refreshGame(); 
                    } else {
                        setLogs(prev => [...prev, logLines[currentLine]]);
                        currentLine++;
                    }
                }, 800); 

            } catch (e: any) {
                setLogs(prev => [...prev, `ERROR: ${e.message}`]);
                setRaiding(false);
            }
        }, 1000); 
    };

    const handleSkipCooldown = async () => {
        if (!walletAddress) { onToast?.('error', 'Connect Wallet to Skip'); return; }
        try {
            onToast?.('info', 'Signing Skip Transaction...');
            await StellarService.deposit(walletAddress, "5"); 
            MockContract.skipCooldown();
            setCooldown(0);
            onToast?.('success', 'Cooldown Skipped!');
        } catch (e: any) { onToast?.('error', 'Payment Failed'); }
    };

    return (
        <>
            <div className="parchment-scroll relative w-full aspect-[3/4] max-h-[500px] flex flex-col p-[12%] pb-[15%] filter drop-shadow-xl">
                <div className="flex items-center justify-between mb-2 border-b-2 border-amber-950/20 pb-2">
                    <h3 className="font-game text-amber-950 text-xl md:text-2xl drop-shadow-sm">
                        Battle Arena
                    </h3>
                    <button onClick={fetchOpponents} className="p-1 hover:bg-amber-900/10 rounded-full transition-colors">
                        <RefreshCw size={16} className={`text-amber-900 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                    {opponents.length === 0 && !loading && (
                        <div className="text-center text-amber-900/50 py-4 italic text-sm">No targets found.</div>
                    )}
                    
                    {opponents.map((opp) => (
                        <div key={opp._id || opp.username} className="flex items-center justify-between border-b border-dashed border-amber-900/30 pb-2 last:border-0 p-1 rounded hover:bg-amber-900/5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded bg-[#5d4037] flex items-center justify-center text-[#d7ccc8] font-bold text-sm border border-[#3e2723]">
                                    {(opp.username || '?').substring(0, 1).toUpperCase()}
                                </div>
                                <div className="leading-tight">
                                    <div className="text-amber-950 font-bold text-sm truncate max-w-[80px]">{opp.username}</div>
                                    <div className="text-[10px] text-amber-900/80 font-mono font-bold">
                                        DEF: {opp.stats?.defense || 0}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => cooldown > 0 ? handleSkipCooldown() : initiateRaid(opp)}
                                disabled={raiding || (user?.username === opp.username)}
                                className={`
                                    ${cooldown > 0 ? 'bg-amber-700 text-white rounded px-2 py-0.5 text-[10px]' : 'w-20 h-10 relative group'}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {cooldown > 0 ? `SKIP` : (
                                    <img src="/assets/btn_stake.png" className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {selectedOpponent && (
                <div className="relative z-50">
                    <BattleInterface 
                        isOpen={modalOpen}
                        balance={xlmBalance}
                        topCommanders={opponents} 
                        onClose={() => setModalOpen(false)}
                        onLaunch={triggerRealTransaction}
                        isRaiding={raiding}
                        attacker={{ name: user?.username || 'YOU', power: currentDps, unit: 'V3_ARMY' }}
                        defender={{ name: selectedOpponent.username, defense: selectedOpponent.stats?.defense || 50, unit: 'FORTRESS_V3' }}
                        logs={logs}
                        result={battleResult}
                    />
                    
                    {awaitingWallet && modalOpen && (
                        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                            <div className="bg-stone-900 border-2 border-amber-500 rounded-xl p-6 flex flex-col items-center animate-bounce-slow">
                                <Wallet size={48} className="text-amber-500 mb-4 animate-pulse" />
                                <h3 className="text-white font-game text-xl mb-2">CHECK YOUR WALLET</h3>
                                <p className="text-stone-400 text-sm mb-4">Sign the transaction in Freighter</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
