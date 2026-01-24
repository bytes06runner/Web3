import React from 'react';
import { Scroll, Clock, TrendingUp } from 'lucide-react';

interface ActivityLogProps {
    history: string[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ history }) => {
    return (
        <div className="parchment-scroll relative w-full aspect-[3/4] max-h-[500px] flex flex-col p-[12%] pb-[15%] filter drop-shadow-xl">
            <h3 className="font-game text-amber-950 text-center text-xl md:text-2xl mb-4 opacity-90 border-b-2 border-amber-900/20 pb-2">Activity Log</h3>
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {history.length === 0 && (
                    <div className="text-center text-amber-900/40 italic text-sm mt-10">No recent activity...</div>
                )}
                {history.map((log, i) => (
                    <div key={i} className="flex gap-2 items-start border-b border-amber-900/10 pb-2 last:border-0 hover:bg-amber-900/5 p-1 rounded">
                        <div className="mt-0.5">
                            {log.includes('Deposit') ? <TrendingUp size={12} className="text-green-800" /> :
                             log.includes('Battle') || log.includes('RAID') ? <Scroll size={12} className="text-red-800" /> :
                             <Clock size={12} className="text-amber-800" />}
                        </div>
                        <p className="text-[11px] font-serif text-amber-900 leading-tight">
                            {log}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
