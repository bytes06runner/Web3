import { useState } from 'react';
import { Heart } from 'lucide-react';
import { MockContract } from '../services/mockContract';

interface FitnessTrackerProps {
    refreshGame: () => void;
    currentSteps: number;
    onToast?: (type: 'success' | 'error', msg: string) => void;
}

export function FitnessTracker({ refreshGame, onToast }: FitnessTrackerProps) {
    const [drill, setDrill] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleRequestDrill = () => {
        setSubmitting(true);
        setTimeout(() => {
            const q = MockContract.requestDrill();
            setDrill(q);
            setSubmitting(false);
            onToast?.('success', 'Drill Request Sent (Tx Confirmed)');
        }, 1000);
    };

    const handleSubmitAnswer = (ans: string) => {
        setSubmitting(true);
        setTimeout(() => {
            const correct = ans === drill.ans;
            MockContract.submitDrill(correct);
            refreshGame();

            if (correct) {
                onToast?.('success', 'Tactical Analysis Correct! +Defense');
            } else {
                onToast?.('error', 'Analysis Failed. -Stamina Penalty');
            }

            setDrill(null);
            setSubmitting(false);
        }, 1000);
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
                        <p className="text-gray-400 mb-4 text-sm">Request a tactical assessment from HQ to improve defense parameters.</p>
                        <button
                            onClick={handleRequestDrill}
                            disabled={submitting}
                            className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? 'Requesting...' : 'Request Drill (Tx)'}
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
                Warning: Incorrect answers deplete Stamina (-5).
            </div>
        </div>
    );
}
