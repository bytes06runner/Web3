import React from 'react';
import { Shield, Zap } from 'lucide-react';
import { MockContract } from '../services/mockContract';
import { StellarService } from '../services/stellarService';

interface Props {
    walletAddress: string | null;
    onUpgrade: () => void;
    onToast: (type: 'success' | 'error', msg: string) => void;
}

export const UpgradeShieldButton: React.FC<Props> = ({ walletAddress, onUpgrade, onToast }) => {
    
    const handleUpgrade = async () => {
        if (!walletAddress) {
            onToast('error', 'Connect Wallet to Upgrade');
            return;
        }
        try {
            await StellarService.deposit(walletAddress, "10"); // Cost 10 XLM
            MockContract.upgradeDefense();
            onUpgrade();
            onToast('success', 'Defense Upgraded!');
        } catch (e: any) {
            onToast('error', 'Upgrade Failed');
        }
    };

    return (
        <div className="w-full flex justify-center py-6">
            <button 
                onClick={handleUpgrade}
                className="relative w-full max-w-2xl h-24 group transition-transform active:scale-95"
            >
                {/* Iron Slab Button Image */}
                <img 
                    src="/assets/btn_slab_upgrade.png" 
                    alt="Upgrade Shield" 
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:brightness-110"
                />
                
                {/* Overlay Content (In case text on image is hard to read or for dynamic price) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                     {/* If image has text 'UPGRADE SHIELD', we can add subtext for price */}
                     <span className="font-game text-amber-500 text-sm tracking-widest bg-black/60 px-3 py-1 rounded border border-amber-900/50 mt-8">
                        COST: 10 XLM
                     </span>
                </div>
            </button>
        </div>
    );
};
