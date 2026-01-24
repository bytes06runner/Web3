import React from 'react';
import { Scroll, Clock, TrendingUp } from 'lucide-react';

interface ActivityLogProps {
    history: string[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ history }) => {
    return (
        <div className="parchment-scroll h-96 p-8 pt-16 pb-12 relative filter drop-shadow-xl">
            <h3 className="font-game text-amber-900 text-center text-xl mb-4 opacity-80 border-b-2 border-amber-900/20 pb-2">Activity Log</h3>
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {history.length === 0 && (
                    <div className="text-center text-amber-900/40 italic text-sm mt-10">No recent activity...</div>
                )}
                {history.map((log, i) => (
                    <div key={i} className="flex gap-3 items-start border-b border-amber-900/10 pb-2 last:border-0">
                        <div className="mt-1">
                            {log.includes('Deposit') ? <TrendingUp size={14} className="text-green-700" /> :
                             log.includes('Battle') || log.includes('RAID') ? <Scroll size={14} className="text-red-700" /> :
                             <Clock size={14} className="text-amber-700" />}
                        </div>
                        <p className="text-xs font-serif text-amber-900 leading-tight">
                            {log}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
