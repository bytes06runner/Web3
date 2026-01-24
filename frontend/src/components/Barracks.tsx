import React, { useState } from 'react';
import { Users, Timer, Zap, Coins } from 'lucide-react';
import { MockContract } from '../services/mockContract';
import { StellarService } from '../services/stellarService';

interface BarracksProps {
    troops: any;
    commandTokens: number;
    stamina: number;
    walletAddress: string | null;
    onTrain: () => void;
    onToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const Barracks: React.FC<BarracksProps> = ({ troops, commandTokens, stamina, walletAddress, onTrain, onToast }) => {
    const [training, setTraining] = useState<string | null>(null);

    const handleTrain = async (type: 'archers' | 'cavalry' | 'giants') => {
        try {
            MockContract.trainTroops(type);
            onTrain();
            onToast('success', `Training ${type.toUpperCase()} Started!`);
        } catch (e: any) {
            onToast('error', e.message);
        }
    };

    const handleRefillStrength = async () => {
        if (!walletAddress) return onToast('error', 'Connect Wallet');
        
        try {
            onToast('info', 'Signing Transaction...');
            await StellarService.deposit(walletAddress, "10"); // 10 XLM Cost
            MockContract.refillStrength();
            onTrain(); // Refresh
            onToast('success', 'Strength Refilled!');
        } catch (e: any) {
            onToast('error', 'Payment Failed');
        }
    };

    const UNITS = [
        { id: 'archers', name: 'Cyber Archer', cost: 10, power: 5, size: 5, icon: '🏹' },
        { id: 'cavalry', name: 'Light Runner', cost: 25, power: 15, size: 10, icon: '🏍️' },
        { id: 'giants', name: 'Mech Titan', cost: 50, power: 50, size: 20, icon: '🤖' },
    ];

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="text-blue-500" /> Barracks
                </h3>
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1 text-yellow-400 font-mono text-sm">
                        <Coins size={14} /> {commandTokens} CMD
                     </div>
                     <div className="flex items-center gap-1 text-cyan-400 font-mono text-sm">
                        <Zap size={14} /> {stamina}%
                     </div>
                </div>
            </div>

            {/* Strength Bar */}
            <div className="mb-6 bg-black/40 rounded-full h-4 overflow-hidden relative group cursor-pointer" onClick={handleRefillStrength} title="Click to Refill (10 XLM)">
                <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${stamina}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    REFILL (10 XLM)
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {UNITS.map(unit => (
                    <div key={unit.id} className="bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 transition-all text-center group relative overflow-hidden">
                        <div className="text-4xl mb-2">{unit.icon}</div>
                        <div className="font-bold text-white mb-1">{unit.name}</div>
                        <div className="text-xs text-gray-400 mb-3">Power: {unit.power} | Cost: {unit.cost}</div>
                        
                        <div className="text-xs font-mono text-blue-300 mb-4">
                            Owned: {troops?.[unit.id] || 0}
                        </div>

                        <button 
                            onClick={() => handleTrain(unit.id as any)}
                            disabled={commandTokens < unit.cost}
                            className="w-full bg-white/10 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-white/10 text-white py-2 rounded-lg text-xs font-bold transition-colors uppercase"
                        >
                            Train
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 text-center text-xs text-gray-500">
                Training consumes Command Tokens. Strength is required for Raids.
            </div>
        </div>
    );
};
