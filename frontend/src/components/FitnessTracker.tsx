import { useState } from 'react';
import { Heart, Flame } from 'lucide-react';
import { MockContract } from '../services/mockContract';

interface FitnessTrackerProps {
    refreshGame: () => void;
    currentSteps: number;
}

export function FitnessTracker({ refreshGame, currentSteps }: FitnessTrackerProps) {
    const [mockSteps, setMockSteps] = useState('1000');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmitSteps = () => {
        setSubmitting(true);
        setTimeout(() => {
            const steps = parseInt(mockSteps);
            if (!isNaN(steps) && steps > 0) {
                MockContract.recordSteps(steps);
                refreshGame();
            }
            setSubmitting(false);
        }, 800);
    };

    const progress = Math.min((currentSteps / 10000) * 100, 100);

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Heart className="text-pink-500" /> Fitness Force
                </h3>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Daily Goal</span>
                    <span className="text-white font-mono">{currentSteps} / 10,000</span>
                </div>
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <Flame size={12} className="text-orange-500" />
                    Bonus Active: +{Math.floor(currentSteps / 1000)} CMD Tokens earned
                </div>
            </div>

            {/* Input for demo */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <label className="text-xs text-gray-400 mb-2 block uppercase tracking-wide">Sync Walking Data (Demo)</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={mockSteps}
                        onChange={(e) => setMockSteps(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white w-full focus:outline-none focus:border-pink-500 transition-colors"
                        placeholder="Steps to add..."
                    />
                    <button
                        onClick={handleSubmitSteps}
                        disabled={submitting}
                        className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Syncing...' : 'Sync'}
                    </button>
                </div>
            </div>
        </div>
    );
}
