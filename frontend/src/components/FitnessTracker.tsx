import { useState } from 'react';
import { Heart } from 'lucide-react';
import { MockContract } from '../services/mockContract';

interface FitnessTrackerProps {
    refreshGame: () => void;
    currentSteps: number;
    onToast?: (type: 'success' | 'error', msg: string) => void;
    walletAddress: string | null;
}

export function FitnessTracker({ refreshGame, onToast, walletAddress }: FitnessTrackerProps) {
    const [drill, setDrill] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleRequestDrill = async () => {
        if (!walletAddress) {
             onToast?.('error', 'Connect Wallet to Train');
             return;
        }

        setSubmitting(true);
        try {
            // Requires signing 10 XLM payment
            const q = await MockContract.requestDrill(walletAddress);
            setDrill(q);
            refreshGame(); // update history
            onToast?.('success', 'Drill Started! 10 XLM Staked.');
        } catch(e: any) {
            onToast?.('error', e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitAnswer = async (ans: string) => {
        if (!walletAddress) return;

        setSubmitting(true);
        try {
            const correct = ans === drill.ans;
            // Requires signing if Wrong (another 10 XLM)
            await MockContract.submitDrill(correct, walletAddress);
            refreshGame();

            if (correct) {
                onToast?.('success', 'Correct! Payout Pending (15 XLM)');
            } else {
                onToast?.('error', 'Wrong! +10 XLM Penalty Paid.');
            }
            setDrill(null);
        } catch(e: any) {
            onToast?.('error', e.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Heart className="text-pink-500" /> Tactical Training
                </h3>
            </div>

            {/* Drill Interface */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 min-h-[160px] flex flex-col justify-center">
                {!drill ? (
                    <div className="text-center">
                        <p className="text-gray-400 mb-4 text-sm">Request a tactical assessment. <strong>Stake 10 XLM.</strong> Win 15 XLM back.</p>
                        <button
                            onClick={handleRequestDrill}
                            disabled={submitting}
                            className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? 'Requesting...' : 'Request Drill (Tx 10 XLM)'}
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs text-pink-400 uppercase tracking-widest font-bold">Priority Message</span>
                            {submitting && <span className="text-xs text-gray-500 animate-pulse">Verifying...</span>}
                        </div>
                        <h4 className="text-white font-medium mb-4">{drill.q}</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {drill.options.map((opt: string) => (
                                <button
                                    key={opt}
                                    onClick={() => handleSubmitAnswer(opt)}
                                    disabled={submitting}
                                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2 px-3 rounded-lg transition-colors text-left border border-white/5 hover:border-pink-500/50"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 text-xs text-center text-gray-600">
                Warning: Incorrect answers deplete Stamina and incur another <strong>10 XLM</strong> penalty.
            </div>
        </div>
    );
}
