import { Sword, Zap, Heart } from 'lucide-react';
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
    { id: 'archers', name: 'Cyber Archer', dps: 3, cap: 5, color: 'text-orange-400', img: '🏹' },
    { id: 'infantry', name: 'Nano Infantry', dps: 5, cap: 10, color: 'text-blue-400', img: '⚔️' },
    { id: 'giants', name: 'Mech Titan', dps: 7, cap: 20, color: 'text-purple-400', img: '🤖' },
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
        <div className="stone-panel p-8 md:p-12 relative min-h-[400px] flex flex-col justify-center drop-shadow-2xl">
            {/* Title Badge similar to reference "The Barracks" */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#3e2723] border-4 border-[#8d6e63] px-6 py-2 rounded-lg shadow-lg z-10">
                <h2 className="font-game text-xl text-[#d7ccc8] uppercase tracking-widest text-shadow-md">The Barracks</h2>
            </div>
            
            {/* Unit Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {UNITS.map((unit) => {
                    const count = troops?.[unit.id] || 0;
                    const max = unit.id === 'archers' ? 4 : 3; // Hardcoded limits from logic

                    return (
                        <div key={unit.id} className="relative group flex flex-col items-center">
                            {/* Podium/Platform Effect */}
                            <div className="bg-black/30 w-full h-full absolute inset-0 rounded-xl border border-white/5 top-2"></div>
                            
                            {/* Character Visualization */}
                            <div className="relative z-10 w-full bg-slate-800/60 border border-slate-600 rounded-xl p-4 flex flex-col items-center backdrop-blur-sm transition-transform hover:-translate-y-1">
                                <div className="text-6xl mb-4 drop-shadow-xl animate-pulse-slow">{unit.img}</div>
                                
                                <h3 className={`font-game text-sm uppercase ${unit.color} mb-1 stroke-black`}>{unit.name}</h3>
                                
                                <div className="flex gap-4 text-xs font-mono text-gray-300 mb-4 bg-black/40 px-2 py-1 rounded">
                                    <span className="flex items-center gap-1"><Sword size={10} /> {unit.dps}</span>
                                    <span className="flex items-center gap-1"><Zap size={10} /> {unit.cap}</span>
                                </div>

                                {/* Count Indicator */}
                                <div className="text-xs font-bold text-white mb-3 bg-slate-700 px-3 py-1 rounded-full border border-slate-500">
                                    {count} / {max}
                                </div>

                                {/* Train Button - Green Elixir Style */}
                                <button
                                    onClick={() => handleTrain(unit.id as any)}
                                    className="btn-train w-32 h-12 flex items-center justify-center font-game text-white text-lg drop-shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={count >= max} // Logic handled in mockContract too
                                >
                                    {/* Text is embedded in button image in real assets usually, but here we overlay text if image is blank button */}
                                    {/* Since generated asset has "TRAIN" text, we don't need text here if the image is perfect. 
                                        But generated image might have text in weird place. 
                                        Let's assume the button image is a blank green button or has generic text. 
                                        Actually I prompted "with text TRAIN". So hide text? 
                                        Or overlay for accessibility. 
                                        Let's overlay text with text-shadow to make it pop or match. 
                                    */}
                                    {/* If the image has text, we can leave this empty or use hidden text. 
                                        Let's assume we need to overlay to be safe. 
                                        Wait, my CSS for .btn-train sets the image. 
                                        I will put text inside but maybe make it invisible if the image works? 
                                        Let's show it for now in case image text is bad.
                                    */}
                                    <span className="sr-only">TRAIN</span> 
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
        </div>
    );
}
