import { useEffect, useState } from 'react';
import { Scroll, Clock, ShieldAlert, Coins, Swords } from 'lucide-react'; // Added helpful icons
import { DataService } from '../services/dataService';

export function ActivityLog({ history }: { history?: any[] }) {
    const [fullLogs, setFullLogs] = useState<any[]>([]);

    useEffect(() => {
        loadLogs();
        const interval = setInterval(loadLogs, 3000); // Live updates
        return () => clearInterval(interval);
    }, [history]); // Also reload if prop changes

    const loadLogs = async () => {
        const logs = await DataService.getActivityLog();
        setFullLogs(logs);
    };

    const getIcon = (type: string) => {
        if (type === 'raid_loss' || type === 'raid_win') return <Swords size={12} className="text-red-400" />;
        if (type === 'deposit') return <Coins size={12} className="text-green-400" />;
        if (type === 'train') return <ShieldAlert size={12} className="text-blue-400" />;
         return <Clock size={12} className="text-amber-700" />;
    };

    return (
        <div className="parchment-scroll relative w-full aspect-[3/4] max-h-[500px] flex flex-col p-[12%] pb-[15%] filter drop-shadow-xl transition-transform hover:scale-[1.01]">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b-2 border-amber-950/20 pb-2">
                 <div className="flex items-center gap-2">
                    <Scroll className="text-amber-900" size={18} />
                    <h3 className="font-game text-amber-950 text-xl md:text-2xl drop-shadow-sm">Activity Log</h3>
                </div>
            </div>

            {/* List */}
             <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                {fullLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 border-b border-dashed border-amber-900/10 pb-2 animate-in slide-in-from-left-2 duration-300">
                         <div className="mt-1">{getIcon(log.type)}</div>
                         <div>
                             <p className="text-sm font-bold text-amber-950/90 leading-tight font-serif">{log.text}</p>
                             <p className="text-[10px] text-amber-900/60 font-mono uppercase mt-0.5">{log.time}</p>
                         </div>
                    </div>
                ))}
             </div>
        </div>
    );
}
