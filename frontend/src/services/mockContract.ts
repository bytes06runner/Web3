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
    lastStepDate: number; // timestamp
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
    lastStepDate: 0
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
        state.history.unshift(`Deposited $${amount} USDC`);
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

    // Updated Logic for Transaction Integration (called from App.tsx normally, but logic helpers here)
    raid: async (targetName: string, userPublicKey: string) => {
        const state = MockContract.getState();
        const COST_STM = 20;

        if (state.stamina < COST_STM) throw new Error(`Not enough Stamina (Need ${COST_STM})`);
        
        // Win Rate 50%
        const success = Math.random() < 0.5; 
        
        if (success) {
             // Win: Gain 30-50 XLM
             const reward = Math.floor(Math.random() * 21) + 30; // 30 to 50
             state.history.unshift(`⚔️ Raid on ${targetName} WON! Requesting Payout of ${reward} XLM...`);
             MockContract.saveState(state);
             
             try {
                await StellarService.payoutToUser(userPublicKey, reward.toString());
                const stateAfter = MockContract.getState();
                stateAfter.commandTokens += reward; // Also give CMD tokens?
                stateAfter.history.unshift(`✅ Payout Received! +${reward} XLM`);
                stateAfter.stamina -= COST_STM;
                MockContract.saveState(stateAfter);
                return { success: true, reward };
             } catch(e) {
                 const stateErr = MockContract.getState();
                 stateErr.history.unshift(`❌ Payout Failed: ${e.message}`);
                 MockContract.saveState(stateErr);
                 throw e;
             }
        } else {
            // Loss: Deduct 50 XLM (User pays Bank)
            const penalty = 50;
             state.history.unshift(`🛡️ Raid on ${targetName} FAILED. Penalty: ${penalty} XLM...`);
             MockContract.saveState(state);

             try {
                 await StellarService.createPaymentToBank(userPublicKey, penalty.toString());
                 const stateAfter = MockContract.getState();
                 stateAfter.history.unshift(`💸 Penalty Paid: -${penalty} XLM`);
                 stateAfter.stamina -= COST_STM;
                 MockContract.saveState(stateAfter);
                 return { success: false, penalty };
             } catch(e) {
                 const stateErr = MockContract.getState();
                 stateErr.history.unshift(`❌ Penalty Transaction Failed or Rejected`);
                 MockContract.saveState(stateErr);
                 throw e;
             }
        }
    },

    requestDrill: async (userPublicKey: string) => {
         // Stake 10 XLM
         // This needs to happen BEFORE the question is revealed ideally, or as "Entry Fee"?
         // User said: "request drill... stake 10 XLM"
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
            // Stake 10 was paid. Win 5 extra -> Total 15 payout.
            try {
                await StellarService.payoutToUser(userPublicKey, "15");
                state.history.unshift(`✅ Correct! Received 15 XLM (Stake + Reward)`);
                state.defense += 5;
                state.commandTokens += 50;
            } catch(e) {
                state.history.unshift(`❌ Reward Payout Failed`);
            }
        } else {
            // Lose -> Lose another 10 XLM (Total 20 loss since 10 staked already)
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
