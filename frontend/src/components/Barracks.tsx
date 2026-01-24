import React, { useState } from 'react';
import { Users, Wallet } from 'lucide-react'; 
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
    
    const handleTrain = async (type: 'archers' | 'cavalry' | 'giants') => {
        try {
            // @ts-ignore
            if (MockContract.trainTroops) {
                MockContract.trainTroops(type);
                onTrain();
                onToast('success', 'Training Started');
            } else {
                console.error("MockContract.trainTroops missing");
            }
        } catch (e: any) {
            onToast('error', e.message);
        }
    };

    const handleRefillStrength = async () => {
        if (!walletAddress) return onToast('error', 'Connect Wallet');
        try {
            onToast('info', 'Signing...');
            await StellarService.deposit(walletAddress, "10"); 
            // @ts-ignore
            if (MockContract.refillStrength) MockContract.refillStrength();
            onTrain(); 
            onToast('success', 'Strength Refilled!');
        } catch (e: any) {
            onToast('error', 'Payment Failed');
        }
    };

    const UNITS = [
        { id: 'archers', name: 'Cyber Archer', cost: 10, power: 5, icon: '🏹' },
        { id: 'cavalry', name: 'Light Runner', cost: 25, power: 15, icon: '🏍️' },
        { id: 'giants', name: 'Mech Titan', cost: 50, power: 50, icon: '🤖' },
    ];

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="text-blue-500" /> Barracks
                </h3>
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1 text-yellow-400 font-mono text-sm">
                        <Wallet size={14} /> {commandTokens} CMD
                     </div>
                     <div className="flex items-center gap-1 text-cyan-400 font-mono text-sm">
                        {stamina}%
                     </div>
                </div>
            </div>

            {/* Strength Bar */}
            <div className="mb-6 bg-black/40 rounded-full h-4 overflow-hidden relative group cursor-pointer" onClick={handleRefillStrength}>
                <div 
                    className="h-full bg-blue-500"
                    style={{ width: stamina + '%' }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                    REFILL (10 XLM)
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {UNITS.map(unit => (
                    <div key={unit.id} className="bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 text-center">
                        <div className="text-2xl mb-2">{unit.icon}</div>
                        <div className="font-bold text-white mb-1">{unit.name}</div>
                        <div className="text-xs text-gray-400 mb-3">Cost: {unit.cost}</div>
                        <div className="text-xs font-mono text-blue-300 mb-4">
                            Owned: {troops?.[unit.id] || 0}
                        </div>
                        <button 
                            onClick={() => handleTrain(unit.id as any)}
                            disabled={commandTokens < unit.cost}
                            className="w-full bg-blue-600/20 hover:bg-blue-600 disabled:opacity-50 text-white py-2 rounded text-xs font-bold"
                        >
                            TRAIN
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
