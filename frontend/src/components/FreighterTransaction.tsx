import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface FreighterTransactionProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    amount: string;
    recipient: string;
}

export const FreighterTransaction: React.FC<FreighterTransactionProps> = ({ isOpen, onConfirm, onCancel, amount, recipient }) => {
    const [step, setStep] = useState<'review' | 'signing' | 'success'>('review');

    useEffect(() => {
        if (isOpen) setStep('review');
    }, [isOpen]);

    const handleSign = () => {
        setStep('signing');
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onConfirm();
            }, 1000);
        }, 1500); // 1.5s fake signing delay
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[350px] bg-[#121212] rounded-xl border border-[#333] shadow-2xl overflow-hidden font-sans text-white transform animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-[#2b2b2b] p-3 flex justify-between items-center border-b border-[#444]">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-purple-600 rounded-full"></div> 
                        <span className="font-bold text-sm tracking-wide">Freighter</span>
                    </div>
                    <div className="text-xs text-gray-400">Testnet</div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center">
                    
                    {step === 'review' && (
                        <>
                            <div className="w-16 h-16 bg-[#1e1e1e] rounded-full flex items-center justify-center mb-4 border border-[#333]">
                                <ShieldCheck className="text-purple-500" size={32} />
                            </div>
                            <h3 className="text-lg font-bold mb-1">Confirm Transaction</h3>
                            <p className="text-gray-400 text-xs text-center mb-6">
                                Contract: <span className="text-purple-400 font-mono">YieldRaiders_v3</span>
                            </p>

                            <div className="w-full bg-[#1e1e1e] rounded p-3 mb-6 border border-[#333]">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Operation</span>
                                    <span className="font-bold">Invoke Host Function</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Amount</span>
                                    <span className="font-bold text-red-400">-{amount} XLM</span>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full">
                                <button onClick={onCancel} className="flex-1 py-3 bg-[#2b2b2b] hover:bg-[#333] rounded-lg font-bold text-sm transition-colors">
                                    Reject
                                </button>
                                <button onClick={handleSign} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-purple-900/20">
                                    Confirm
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'signing' && (
                        <div className="py-8 flex flex-col items-center">
                            <Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
                            <h3 className="font-bold text-lg">Signing...</h3>
                            <p className="text-gray-400 text-xs mt-2">Please wait while the network confirms.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-8 flex flex-col items-center animate-in zoom-in">
                            <CheckCircle2 className="text-green-500 mb-4" size={48} />
                            <h3 className="font-bold text-lg text-green-400">Confirmed</h3>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
