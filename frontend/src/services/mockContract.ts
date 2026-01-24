// @ts-nocheck
import { StellarService } from './stellarService';

const STORAGE_KEY = 'yield_raiders_state';

interface GameState {
    principal: number;
    commandTokens: number;
    yieldEarned: number;
    stepCount: number;
    lastYieldTime: number;
    defense: number;
    history: string[];
    stamina: number;
    streakDays: number;
    lastStepDate: number; 
    wallHp: number;
    troopCount: number;
    troopLevel: number;
}

const INITIAL_STATE: GameState = {
    principal: 0,
    commandTokens: 50,
    yieldEarned: 0,
    stepCount: 0,
    lastYieldTime: Date.now(),
    defense: 100,
    history: ['Welcome to Yield Raiders! Deposit USDC or Connect Wallet to start.'],
    stamina: 100,
    streakDays: 0,
    lastStepDate: 0,
    wallHp: 100,
    troopCount: 50,
    troopLevel: 1
};

export const MockContract = {
    getState: (): GameState => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? { ...INITIAL_STATE, ...JSON.parse(stored) } : INITIAL_STATE;
    },

    saveState: (state: GameState) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },

    setPrincipal: (amount: number) => {
        const state = MockContract.getState();
        state.principal = amount;
        MockContract.saveState(state);
        return state;
    },

    deposit: (amount: number) => {
        const state = MockContract.getState();
        state.principal += amount;
        state.history.unshift(`Deposited ${amount} USDC`);
        MockContract.saveState(state);
        return state;
    },

    claimYield: () => {
        const state = MockContract.getState();
        const now = Date.now();
        const elapsedSeconds = (now - state.lastYieldTime) / 1000;
        let rate = 0.01 + (Math.min(state.streakDays, 10) * 0.001);
        const yieldAmount = (state.principal * rate * elapsedSeconds) / 60;

        if (state.stamina < 100) state.stamina = Math.min(100, state.stamina + (elapsedSeconds / 10));

        if (yieldAmount > 0) {
            state.yieldEarned += yieldAmount;
            state.commandTokens += yieldAmount * 10;
            state.lastYieldTime = now;
            if (yieldAmount > 0.01) {
                state.history.unshift(`Claimed Yield + ${(yieldAmount * 10).toFixed(2)} CMD`);
            }
            MockContract.saveState(state);
        }
        return state;
    },

    recordSteps: (steps: number) => {
        const state = MockContract.getState();
        state.stepCount += steps;
        if (steps >= 1000) state.streakDays += 1;
        
        const bonus = Math.floor(steps / 100);
        if (bonus > 0) {
            state.commandTokens += bonus;
            state.defense += Math.floor(bonus / 2);
            state.history.unshift(`Walked ${steps} steps! Earned ${bonus} CMD`);
        }
        state.lastStepDate = Date.now();
        MockContract.saveState(state);
        return state;
    },

        raid: async (targetName: string, userPublicKey: string, troopCount: number = 10, defenderStats: any = { defense: 50 }) => {
        const state = MockContract.getState();
        
        const TROOP_ATK = 15;
        const totalAttack = troopCount * TROOP_ATK;
        const defensePower = (defenderStats.defense || 50) * 1.5; 

        // Initial Stamina/Troop Check
        if (state.troopCount < troopCount) {
             throw new Error("Not enough troops in garrison!");
        }

        // --- PROBABILITY LOGIC ---
        // Base 50% chance
        // Adjust by (Attack - Defense) / Scale
        // If Attack = 150, Defense = 75 (High Advantage) -> +0.3 -> 80% Win
        // If Attack = 150, Defense = 300 (High Disadvantage) -> -0.3 -> 20% Win
        
        const diff = totalAttack - defensePower;
        const scale = Math.max(totalAttack, defensePower) || 1;
        let winChance = 0.5 + (diff / (scale * 2)); 
        
        // Clamp 10% - 90%
        winChance = Math.max(0.1, Math.min(0.9, winChance));
        
        const roll = Math.random();
        let success = roll < winChance;
        
        let destruction = 0;
        let phase = "Ambush"; // Simplified for now
        let logMsg = "";
        let reward = 0;

        if (success) {
            // Victory
            // Calculate destruction based on margin
            const margin = winChance - roll; // Higher margin = more destruction
            if (margin > 0.3) destruction = 100;
            else if (margin > 0.1) destruction = 50;
            else destruction = 30;

            logMsg = `⚔️ Raid on ${targetName} SUCCESS! (Chance: ${(winChance*100).toFixed(0)}%) - ${destruction}% Destruction`;
        } else {
            destruction = 0;
            logMsg = `🛡️ Raid on ${targetName} FAILED. Defense held strong. (Chance: ${(winChance*100).toFixed(0)}%)`;
        }
        
        let payoutPct = 0;
        if (destruction >= 100) payoutPct = 90; // 90 XLM
        else if (destruction >= 50) payoutPct = 50;
        else if (destruction >= 30) payoutPct = 20;
        
        reward = payoutPct; // Simple 1:1 for now or pool based
        
        if (success && reward > 0) {
             try {
                // await StellarService.payoutToUser(userPublicKey, reward.toString());
                state.commandTokens += reward * 10;
                state.yieldEarned += reward; // Simulate XLM gain in yield tracker too? Or separate.
                state.history.unshift(`✅ Raid Victory! Looted ${reward} XLM`);
             } catch(e) {
                 state.history.unshift(`❌ Payout Simulated Failed`);
             }
        }
        
        state.history.unshift(logMsg);

        // Deduct Troops
        const lossRate = success ? 0.1 : 0.4;
        state.troopCount = Math.max(0, Math.floor(state.troopCount * (1 - lossRate)));
        
        MockContract.saveState(state);
        return { success, reward, destruction, phase, log: logMsg };
    },

    requestDrill: async (userPublicKey: string) => {
         try {
             await StellarService.createPaymentToBank(userPublicKey, "10");
             const state = MockContract.getState();
             state.history.unshift(`📚 Drill Requested. Staked 10 XLM.`);
             MockContract.saveState(state);
        
             const QUESTIONS = [
                { id: 1, q: "What consensus mechanism does Stellar use?", options: ["PoW", "PoS", "SCP", "PoH"], ans: "SCP" },
                { id: 2, q: "What is the native token of Soroban?", options: ["ETH", "XLM", "SOL", "USDC"], ans: "XLM" },
                { id: 3, q: "Which function authorizes a contract call?", options: ["require_auth", "check_sig", "validate", "sign"], ans: "require_auth" },
            ];
            return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
         } catch(e) {
             throw new Error("Staking Failed. Cannot start drill.");
         }
    },

    submitDrill: async (correct: boolean, userPublicKey: string) => {
        const state = MockContract.getState();
        if (correct) {
            try {
                await StellarService.payoutToUser(userPublicKey, "15");
                state.history.unshift(`✅ Correct! Received 15 XLM (Stake + Reward)`);
                state.defense += 5;
                state.commandTokens += 50;
            } catch(e) {
                state.history.unshift(`❌ Reward Payout Failed`);
            }
        } else {
            try {
                await StellarService.createPaymentToBank(userPublicKey, "10");
                state.stamina = Math.max(0, state.stamina - 5);
                state.history.unshift(`❌ Wrong Answer! Penalty: Additional 10 XLM Paid.`);
            } catch(e) {
                state.history.unshift(`❌ Penalty Transaction Failed`);
            }
        }
        MockContract.saveState(state);
        return state;
    }
};
