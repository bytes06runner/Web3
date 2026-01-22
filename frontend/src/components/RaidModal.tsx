import React, { useState, useEffect } from 'react';
import { AlertTriangle, Brain } from 'lucide-react';

interface RaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  opponentName: string;
  opponentDefense: number;
}

export const RaidModal: React.FC<RaidModalProps> = ({ isOpen, onClose, onSuccess, opponentName, opponentDefense }) => {
  const [puzzle, setPuzzle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<'success' | 'failure' | null>(null);

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      setSelectedOption(null);
      fetchPuzzle();
    }
  }, [isOpen]);

  const fetchPuzzle = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/puzzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defenseLevel: opponentDefense ?? 100 }),
      });
      if (!res.ok) throw new Error('Failed to load defense protocols');
      const data = await res.json();
      setPuzzle(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyAnswer = (option: string) => {
    setSelectedOption(option);
    if (option === puzzle.answer) {
        setResult('success');
        setTimeout(() => {
            onSuccess();
        }, 1500); // Wait for animation
    } else {
        setResult('failure');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-purple-500/30 w-full max-w-lg rounded-2xl p-6 shadow-2xl shadow-purple-500/20 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <Brain className="text-purple-400" />
                Tactical Breach
            </h3>
            <p className="text-purple-200/60 text-sm mt-1">
                Bypass {opponentName}'s Defense Systems (Lv. {opponentDefense})
            </p>
        </div>

        {loading && (
            <div className="py-12 text-center text-purple-300 animate-pulse">
                Decrypting Firewall Protocols...
            </div>
        )}

        {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl text-center">
                <AlertTriangle className="mx-auto mb-2" />
                {error}
                <button onClick={onClose} className="block w-full mt-4 bg-red-500/20 hover:bg-red-500/30 py-2 rounded-lg text-sm">Cancel Raid</button>
            </div>
        )}

        {!loading && puzzle && !error && (
            <div className="space-y-6">
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-lg font-medium text-center text-white">
                    {puzzle.question}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {puzzle.options.map((opt: string) => (
                        <button
                            key={opt}
                            disabled={!!result}
                            onClick={() => verifyAnswer(opt)}
                            className={`p-4 rounded-xl border font-bold transition-all
                                ${result && opt === puzzle.answer 
                                    ? 'bg-green-500/20 border-green-500 text-green-300 scale-105' 
                                    : result && selectedOption === opt && opt !== puzzle.answer
                                        ? 'bg-red-500/20 border-red-500 text-red-300'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50 text-gray-300'
                                }
                            `}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {result === 'success' && (
                    <div className="text-center text-green-400 font-bold animate-pulse">
                        ACCESS GRANTED. INITIATING RAID...
                    </div>
                )}
                {result === 'failure' && (
                    <div className="text-center">
                        <div className="text-red-400 font-bold mb-2">ACCESS DENIED. SECURITY ALERT TRIGGERED.</div>
                        <button onClick={onClose} className="text-sm underline text-gray-400 hover:text-white">Retreat</button>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
