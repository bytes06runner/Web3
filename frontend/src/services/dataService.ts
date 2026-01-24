
// Data Service: Acts as a persistent local backend for the Netlify Demo
// This ensures "merged" behavior with persistent data across reloads.

const DB_KEYS = {
    USER: 'yr_user_v1',
    LEADERBOARD: 'yr_leaderboard_v1',
    ACTIVITY: 'yr_activity_v1',
    GAME_STATE: 'yr_gamestate_v1'
};

// Seed Data
const MOCK_LEADERBOARD = [
    { rank: 1, username: 'Mamatar P...', score: 400, wallet: 'G...XLM' },
    { rank: 2, username: 'Sanjeet', score: 30, wallet: 'G...HOH' }, // User seen in screenshot
    { rank: 3, username: 'CryptoKing', score: 25, wallet: 'G...WW2' },
    { rank: 4, username: 'StellarWarlord', score: 10, wallet: 'G...P99' }
];

const MOCK_ACTIVITY = [
    { id: 1, text: "Trained INFANTRY (Occupy 10 Cap)", time: "2 mins ago", type: 'train' },
    { id: 2, text: "Trained ARCHERS (Occupy 5 Cap)", time: "5 mins ago", type: 'train' },
    { id: 3, text: "RAID (STAKED 100 XLM)", time: "10 mins ago", type: 'raid_loss' },
    { id: 4, text: "Deposited 100 USDC", time: "1 hour ago", type: 'deposit' }
];

export class DataService {

    // --- USER MANAGEMENT ---
    static getUser() {
        const u = localStorage.getItem(DB_KEYS.USER);
        return u ? JSON.parse(u) : null;
    }

    static saveUser(user: any) {
        localStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
    }

    static async login(username: string): Promise<any> {
        await this.delay(600);
        let user = this.getUser();
        
        // Use existing or create new "Cloud" profile
        if (!user || user.username !== username) {
             user = {
                username,
                walletAddress: "GCK5IIOTUSM64HZPN7M6ARVM7QIMMYJY", // Default from screenshot
                stats: { defense: 80, wins: 2 },
                troops: { archers: 0, infantry: 0, giants: 0 },
                resources: { gold: 1000, elixir: 500 }
             };
             this.saveUser(user);
        }
        return user;
    }

    // --- LEADERBOARD ---
    static async getLeaderboard() {
        await this.delay(400);
        const stored = localStorage.getItem(DB_KEYS.LEADERBOARD);
        if (!stored) {
            localStorage.setItem(DB_KEYS.LEADERBOARD, JSON.stringify(MOCK_LEADERBOARD));
            return MOCK_LEADERBOARD;
        }
        return JSON.parse(stored);
    }

    static updateLeaderboard(username: string, scoreAdd: number) {
        let board = this.getLeaderboardSync();
        const existing = board.find((p: any) => p.username === username);
        if (existing) {
            existing.score += scoreAdd;
        } else {
            board.push({ rank: board.length + 1, username, score: scoreAdd, wallet: 'G...YOU' });
        }
        // Re-sort
        board.sort((a: any, b: any) => b.score - a.score);
        board.forEach((p: any, i: number) => p.rank = i + 1);
        
        localStorage.setItem(DB_KEYS.LEADERBOARD, JSON.stringify(board));
    }

    static getLeaderboardSync() {
        const stored = localStorage.getItem(DB_KEYS.LEADERBOARD);
        return stored ? JSON.parse(stored) : MOCK_LEADERBOARD;
    }

    // --- ACTIVITY LOG ---
    static async getActivityLog() {
        await this.delay(300);
        const stored = localStorage.getItem(DB_KEYS.ACTIVITY);
        if (!stored) {
            localStorage.setItem(DB_KEYS.ACTIVITY, JSON.stringify(MOCK_ACTIVITY));
            return MOCK_ACTIVITY;
        }
        return JSON.parse(stored);
    }

    static addActivity(text: string, type: string) {
        const logs = this.getActivityLogSync();
        const newLog = { 
            id: Date.now(), 
            text, 
            time: "Just now", 
            type 
        };
        const updated = [newLog, ...logs].slice(0, 10); // Keep last 10
        localStorage.setItem(DB_KEYS.ACTIVITY, JSON.stringify(updated));
        return updated;
    }

    static getActivityLogSync() {
         const stored = localStorage.getItem(DB_KEYS.ACTIVITY);
         return stored ? JSON.parse(stored) : MOCK_ACTIVITY;
    }

    // --- MOCK NETWORK DELAY ---
    static delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
