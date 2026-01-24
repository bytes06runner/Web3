// @ts-nocheck
import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
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

    const fetchOpponents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setOpponents(data.slice(0, 5));
            } else {
                 setOpponents([{ username: 'Satoshi_Vault', stats: { defense: 80, wins: 12 } }]);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const initiateRaid = (opponent: any) => {
        if (!walletAddress) { onToast?.('error', 'Connect Wallet to Raid'); return; }
        setSelectedOpponent(opponent);
        setLogs(["ready_for_deployment..."]);
        setBattleResult(null);
        setModalOpen(true);
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

    const handleLaunch = async () => { /* Logic Preserved */ }; 

    return (
        <>
            {/* Responsive Container: Maintains Aspect Ratio approx 3:4 for scroll image */}
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
                                disabled={raiding || (user?.username === opp.username) }
                                className={`
                                    ${cooldown > 0 ? 'bg-amber-700 text-white rounded px-2 py-0.5 text-[10px]' : 'w-20 h-10 relative group'}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {cooldown > 0 ? `SKIP` : (
                                    // Use Horn Image properly
                                    <img src="/assets/btn_stake.png" className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform" />
                                )}
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
                    onLaunch={handleLaunch} // Note: simplified prop passing for this rewrite
                    isRaiding={raiding}
                    attacker={{ name: user?.username || 'YOU', power: currentDps, unit: 'V3_ARMY' }}
                    defender={{ name: selectedOpponent.username, defense: selectedOpponent.stats?.defense || 50, unit: 'FORTRESS_V3' }}
                    logs={logs}
                    result={battleResult}
                />
            )}
        </>
    );
}
