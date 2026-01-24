// @ts-nocheck
import React, { useState } from 'react';
import { Users, Wallet, Shield, Zap } from 'lucide-react';
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
    
    // Derived Calculations (archers 5, infantry 10, giants 20)
    const capacityUsed = ((troops?.archers || 0) * 5) + ((troops?.infantry || 0) * 10) + ((troops?.giants || 0) * 20);
    const maxCapacity = 100;

    const handleTrain = async (type: 'archers' | 'infantry' | 'giants') => {
        try {
            MockContract.trainTroops(type);
            onTrain();
            onToast('success', `Training ${type.toUpperCase()} Started`);
        } catch (e: any) {
            onToast('error', e.message);
        }
    };

    const handleUpgradeDefense = async () => {
        if (!walletAddress) return onToast('error', 'Connect Wallet');
        try {
            onToast('info', 'Signing Upgrade (10 XLM)...');
            await StellarService.deposit(walletAddress, "10"); 
            MockContract.upgradeDefense();
            onTrain(); 
            onToast('success', 'Defense Upgraded!');
        } catch (e: any) {
            onToast('error', 'Upgrade Failed');
        }
    };

    const UNITS = [
        { id: 'archers', name: 'Cyber Archer', cost: 5, power: 3, limit: 4, icon: '🏹' },
        { id: 'infantry', name: 'Nano Infantry', cost: 10, power: 5, limit: 3, icon: '⚔️' },
        { id: 'giants', name: 'Mech Titan', cost: 20, power: 7, limit: 3, icon: '🤖' },
    ];

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="text-blue-500" /> The Barracks
                </h3>
            </div>

            {/* Capacity Bar */}
            <div className="mb-2 flex justify-between text-xs text-gray-400">
                <span>GARRISON CAPACITY</span>
                <span>{capacityUsed} / {maxCapacity}</span>
            </div>
            <div className="mb-6 bg-black/40 rounded-full h-4 overflow-hidden border border-white/5">
                <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                    style={{ width: (capacityUsed / maxCapacity * 100) + '%' }}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {UNITS.map(unit => {
                    const count = troops?.[unit.id] || 0;
                    const isMax = count >= unit.limit;
                    const canAfford = (capacityUsed + unit.cost) <= maxCapacity;
                    
                    return (
                        <div key={unit.id} className="bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 text-center relative group">
                            <div className="text-3xl mb-2">{unit.icon}</div>
                            <div className="font-bold text-white mb-1">{unit.name}</div>
                            
                            <div className="flex justify-between text-[10px] text-gray-400 mb-2 px-2 bg-black/20 rounded py-1">
                                <span>DPS: {unit.power}</span>
                                <span>CAP: {unit.cost}</span>
                            </div>
                            
                            <div className="text-xs font-mono text-cyan-300 mb-3 border border-cyan-500/30 rounded px-2 py-1 inline-block">
                                {count} / {unit.limit}
                            </div>

                            <button 
                                onClick={() => handleTrain(unit.id as any)}
                                disabled={isMax || !canAfford}
                                className={`w-full py-2 rounded text-xs font-bold uppercase transition-all ${isMax ? 'bg-green-500/20 text-green-400 cursor-default' : !canAfford ? 'bg-red-500/20 text-red-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                            >
                                {isMax ? 'MAXED' : !canAfford ? 'FULL' : 'TRAIN'}
                            </button>
                        </div>
                    );
                })}
            </div>
            
            {/* Defense Upgrade Hook */}
            <div className="border-t border-white/10 pt-4">
               <button onClick={handleUpgradeDefense} className="w-full flex items-center justify-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 py-3 rounded-xl font-bold uppercase tracking-wider transition-all">
                   <Shield size={16} /> Upgrade Shield (+5 DEF) - 10 XLM
               </button>
            </div>
        </div>
    );
};
