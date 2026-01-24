import { Sword, Zap } from 'lucide-react';
import { MockContract } from '../services/mockContract';

interface BarracksProps {
    troops: any;
    commandTokens: number;
    stamina: number;
    walletAddress: string | null;
    onTrain: () => void;
    onToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

const UNITS = [
    { id: 'archers', name: 'Cyber Archer', dps: 3, cap: 5, color: 'text-orange-400', img: '/assets/portrait_archer.png' },
    { id: 'infantry', name: 'Nano Infantry', dps: 5, cap: 10, color: 'text-blue-400', img: '/assets/portrait_infantry.png' },
    { id: 'giants', name: 'Mech Titan', dps: 7, cap: 20, color: 'text-red-500', img: '/assets/portrait_titan.png' },
];

export function Barracks({ troops, commandTokens, stamina, walletAddress, onTrain, onToast }: BarracksProps) {
    
    const handleTrain = (type: 'archers' | 'infantry' | 'giants') => {
        try {
            MockContract.trainTroops(type);
            onTrain();
            onToast('success', `Training ${type}...`);
        } catch (e: any) {
            onToast('error', e.message);
        }
    };

    return (
        <div className="stone-panel p-8 relative min-h-[500px] flex flex-col justify-center drop-shadow-2xl">
            {/* Title Badge */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#2d2d2d] border-4 border-[#1a1a1a] px-8 py-2 rounded shadow-2xl z-20">
                <h2 className="font-game text-2xl text-[#a8a8a8] uppercase tracking-[0.2em] text-shadow-md border-b-2 border-[#555] pb-1">The Barracks</h2>
            </div>
            
            {/* Unit Grid - Dungeon Cell Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 px-4">
                {UNITS.map((unit) => {
                    const count = troops?.[unit.id] || 0;
                    const max = unit.id === 'archers' ? 4 : 3;

                    return (
                        <div key={unit.id} className="relative group flex flex-col items-center cursor-pointer">
                            {/* Portrait Frame/Cell - ENHANCED HOVER */}
                            <div className="relative w-full aspect-[2/3] bg-black border-4 border-[#333] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden transition-all duration-300 ease-out group-hover:border-yellow-500/50 group-hover:rotate-1 group-hover:scale-[1.02] group-hover:shadow-[0_0_25px_rgba(234,179,8,0.5)]">
                                <img 
                                    src={unit.img} 
                                    alt={unit.name}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-y-3 transition-all duration-500 ease-out filter contrast-125"
                                />
                                {/* Bottom Gradient Overlay for Text */}
                                <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                                
                                <div className="absolute bottom-4 left-0 w-full text-center">
                                    <h3 className={`font-game text-lg uppercase ${unit.color} text-shadow-black tracking-wider group-hover:text-yellow-300 transition-colors`}>{unit.name}</h3>
                                    <div className="flex justify-center gap-4 text-xs font-mono text-gray-400 mt-1">
                                        <span className="flex items-center gap-1 bg-black/50 px-2 rounded"><Sword size={10} /> {unit.dps}</span>
                                        <span className="flex items-center gap-1 bg-black/50 px-2 rounded"><Zap size={10} /> {unit.cap}</span>
                                    </div>
                                </div>

                                {/* Count Overlay Top Right */}
                                <div className="absolute top-2 right-2 bg-black/80 border border-white/20 px-2 py-1 text-xs font-mono text-white">
                                    {count}/{max}
                                </div>
                            </div>

                            {/* Stone Train Button */}
                            <button
                                onClick={() => handleTrain(unit.id as any)}
                                className="mt-4 relative w-36 h-14 group-active:scale-95 transition-transform"
                                disabled={count >= max}
                            >
                                <img src="/assets/btn_stone_train.png" className="w-full h-full object-contain filter drop-shadow-lg" alt="Train" />
                                <span className="sr-only">TRAIN</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
