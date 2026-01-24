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
    capacity: number;
    consecutiveWins: number;
    cooldownUntil: number;
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
    troopLevel: 1,
    capacity: 100,
    consecutiveWins: 0,
    cooldownUntil: 0
};

export const MockContract = {
    getState: (): GameState => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? { ...INITIAL_STATE, ...JSON.parse(stored) } : INITIAL_STATE;
    },

    saveState: (state: GameState) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },

    setCapacity: (amount: number) => {
        const state = MockContract.getState();
        state.capacity = amount || 100;
        MockContract.saveState(state);
        return state;
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

                raid: async (targetName: string, userPublicKey: string, troopCount: number = 10, defenderStats: any = { defense: 50, unit: 'FORTRESS_V1' }) => {
        const state = MockContract.getState();
        // --- COOLDOWN CHECK ---
        const now = Date.now();
        if (state.cooldownUntil && state.cooldownUntil > now) {
            const remaining = Math.ceil((state.cooldownUntil - now) / 1000);
            throw new Error(`Army Resting! Cooldown: ${remaining}s`);
        }

        
        // --- STAMINA CHECK ---
        const STAMINA_COST = 10;
        if (state.stamina < STAMINA_COST) {
            throw new Error("Insufficient Stamina! Rest needed.");
        }
        state.stamina -= STAMINA_COST;
        
        // --- CAPACITY RATIO LOGIC ---
        const capacity = state.capacity || 100;
        const staminaRatio = state.stamina / capacity;
        
        const TROOP_ATK = 15;
        let totalAttack = troopCount * TROOP_ATK;
        const defensePower = (defenderStats.defense || 50) * 1.5; 

        // --- UNIT ADVANTAGE SYSTEM ---
        const myUnit = 'CYBER_UNIT'; 
        const defUnit = defenderStats.unit || 'FORTRESS_V1';
        let advantageMsg = "";
        let advantageMult = 1.0;

        if (myUnit === 'CYBER_UNIT' && defUnit === 'FORTRESS_V1') {
            advantageMult = 1.25;
            advantageMsg = "⚡ UNIT ADVANTAGE";
        } else if (defUnit === 'CYBER_UNIT') { 
            advantageMult = 1.0;
        }

        totalAttack = totalAttack * advantageMult;

        // --- RATIO PHASE MODIFIERS ---
        let winChanceMod = 0;
        let phase = "Ambush";
        let phaseMsg = "";

        if (staminaRatio < 0.70) {
            winChanceMod -= 0.3; // 30% penalty
            phaseMsg = "⚠️ PHASE 1 STRUGGLE (Low Energy)";
            phase = "Breach";
        } else if (staminaRatio > 0.90) {
             winChanceMod += 0.2; // 20% bonus
             phaseMsg = "🚀 PHASE 2 BOOST (High Energy)";
             phase = "Ambush";
        } 
        
        // --- CRITICAL HIT ---
        const isCrit = Math.random() < 0.10; 
        
        // --- PROBABILITY LOGIC ---
        const diff = totalAttack - defensePower;
        const scale = Math.max(totalAttack, defensePower) || 1;
        let winChance = 0.5 + (diff / (scale * 2)); 
        
        // Apply Ratio Modifier
        winChance += winChanceMod;
        
        winChance = Math.max(0.1, Math.min(0.9, winChance));
        
        const roll = Math.random();
        let success = isCrit || (roll < winChance);
        let destruction = 0;
        let logMsg = "";
        let reward = 0;

        if (success) {
            state.consecutiveWins = (state.consecutiveWins || 0) + 1;
            if (state.consecutiveWins >= 5) {
                state.cooldownUntil = Date.now() + 10000;
                state.consecutiveWins = 0;
                logMsg += " (💤 Army Resting 10s)";
            }
            // Victory
            const margin = winChance - roll; 
            
            // PHASE 3 CHECK
            if (staminaRatio > 0.97) {
                 destruction = 100;
                 reward += 100; // Bonus
                 logMsg = `💎 PHASE 3 UNLOCKED: VAULT CRACKED! (+100 XLM) `;
                 phase = "Vault";
            } else if (isCrit) {
                destruction = 100;
                logMsg = `💥 CRITICAL HIT! 100% DESTRUCTION!`;
            } else {
                 if (margin > 0.3) destruction = 100;
                 else if (margin > 0.1) destruction = 75;
                 else destruction = 40;
                 logMsg = `⚔️ Raid SUCCESS! ${phaseMsg}`;
            }
        } else {
            state.consecutiveWins = 0;
            destruction = Math.floor(Math.random() * 10); 
            logMsg = `🛡️ Raid FAILED. ${phaseMsg}`;
        }
        
        let payoutPct = 0;
        if (destruction >= 100) payoutPct = 100; 
        else if (destruction >= 75) payoutPct = 50;
        else if (destruction >= 40) payoutPct = 25;
        
        reward += payoutPct; 
        
        if (success && reward > 0) {
             try {
                // await StellarService.payoutToUser(userPublicKey, reward.toString());
                state.commandTokens += reward * 10;
                state.yieldEarned += reward; 
                state.history.unshift(`✅ Victory! Looted ${reward} XLM`);
             } catch(e) {
                 state.history.unshift(`❌ Payout Simulated Failed`);
             }
        }
        
        state.history.unshift(logMsg);

        // Deduct Troops
        const lossRate = success ? 0.05 : 0.3;
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
