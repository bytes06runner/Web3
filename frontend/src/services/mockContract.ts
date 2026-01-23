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

    raid: async (targetName: string, userPublicKey: string, troopCount: number = 10) => {
        const state = MockContract.getState();
        
        const TROOP_DMG = 5;
        const TROOP_STA = 20;
        
        if (state.troopCount < troopCount) {
             throw new Error("Not enough troops in garrison!");
        }

        const totalPotential = troopCount * TROOP_STA * TROOP_DMG;
        const wallHp = state.wallHp || 100; 
        
        let destruction = 0;
        let success = false;
        let reward = 0;
        let logMsg = "";
        let phase = "Breach";

        // --- PHASE 1: BREACH ---
        if (totalPotential < wallHp) {
             destruction = 0;
             success = false;
             logMsg = `🛡️ Raid on ${targetName} BLOCKED by Wall. 0% Destruction.`;
        } else {
             destruction = 30;
             phase = "Ambush";
             
             const staminaConsumed = Math.ceil(wallHp / TROOP_DMG);
             const totalStaminaPool = troopCount * TROOP_STA;
             let remainingStamina = totalStaminaPool - staminaConsumed;
             
             if (remainingStamina <= 0) {
                 logMsg = `⚠️ Wall Breached (30%), but troops exhausted!`;
                 success = true; 
             } else {
                 // --- PHASE 2: AMBUSH ---
                 const DEF_TROOPS = 10; 
                 const defenderPower = DEF_TROOPS * TROOP_DMG * TROOP_STA;
                 
                 const attackerPower = remainingStamina * TROOP_DMG;
                 
                 if (attackerPower > defenderPower) {
                      destruction = (attackerPower > defenderPower * 1.5) ? 100 : 50;
                      success = true;
                      logMsg = `⚔️ Raid on ${targetName} VICTORY! (${destruction}% Destruction)`;
                 } else {
                      destruction = 30; 
                      success = true; 
                      logMsg = `⚠️ Wall Breached, but Ambush repelled!`;
                 }
             }
        }
        
        let payoutPct = 0;
        if (destruction >= 100) payoutPct = 0.9;
        else if (destruction >= 50) payoutPct = 0.5;
        else if (destruction >= 30) payoutPct = 0.2;
        
        const POOL = 500;
        reward = Math.floor(POOL * payoutPct);
        
        if (success && reward > 0) {
             state.history.unshift(logMsg + ` Payout: ${reward} XLM`);
             try {
                // await StellarService.payoutToUser(userPublicKey, reward.toString());
                state.commandTokens += reward; 
                state.history.unshift(`✅ Payout Received! +${reward} XLM`);
             } catch(e) {
                 state.history.unshift(`❌ Payout Tx Simulated Failed`);
             }
        } else {
             state.history.unshift(logMsg);
        }
        
        if (destruction === 100) state.troopCount -= Math.floor(troopCount * 0.1);
        else if (destruction >= 30) state.troopCount -= Math.floor(troopCount * 0.5);
        else state.troopCount -= Math.floor(troopCount * 0.8); 
        
        state.troopCount = Math.max(0, state.troopCount);

        MockContract.saveState(state);
        return { success, reward, destruction, phase };
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
