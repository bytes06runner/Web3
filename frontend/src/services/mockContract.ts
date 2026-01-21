// Simulates the Soroban smart contract interaction
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
    history: ['Welcome to Yield Raiders! Deposit USDC to start earning.'],
    stamina: 100,
    streakDays: 0,
    lastStepDate: 0
};

export const MockContract = {
    getState: (): GameState => {
        const stored = localStorage.getItem(STORAGE_KEY);
        // Merge with initial state to ensure new fields act properly on existing saves
        return stored ? { ...INITIAL_STATE, ...JSON.parse(stored) } : INITIAL_STATE;
    },

    saveState: (state: GameState) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

        // Base API: 1% per minute
        let rate = 0.01;
        // Streak Bonus: +0.1% per streak day (cap at 10 days)
        const streakBonus = Math.min(state.streakDays, 10) * 0.001;
        rate += streakBonus;

        const yieldAmount = (state.principal * rate * elapsedSeconds) / 60;

        // Stamina Regen: 1 per 10 seconds (approx)
        if (state.stamina < 100) {
            state.stamina = Math.min(100, state.stamina + (elapsedSeconds / 10));
        }

        if (yieldAmount > 0) {
            state.yieldEarned += yieldAmount;
            state.commandTokens += yieldAmount * 10;
            state.lastYieldTime = now;
            // Only log significant yield claims to avoid spam
            if (yieldAmount > 0.01) {
                state.history.unshift(`Claimed Yield + ${(yieldAmount * 10).toFixed(2)} CMD (Streak: ${state.streakDays}🔥)`);
            }
            MockContract.saveState(state);
        }
        return state;
    },

    recordSteps: (steps: number) => {
        const state = MockContract.getState();
        const now = Date.now();
        state.stepCount += steps;

        // Check for streak (simplified: if last step was > 24h ago, reset. If < 24h but > 12h, inc?)
        // For demo: Every time you submit > 1000 steps, inc streak
        if (steps >= 1000) {
            state.streakDays += 1;
            state.history.unshift(`🔥 STREAK INCREASED! Now at ${state.streakDays} days!`);
        }

        // Bonus tokens
        const bonus = Math.floor(steps / 100);
        if (bonus > 0) {
            state.commandTokens += bonus;
            state.defense += Math.floor(bonus / 2);
            state.history.unshift(`Walked ${steps} steps! Earned ${bonus} CMD & Defense Boost`);
        }
        state.lastStepDate = now;
        MockContract.saveState(state);
        return state;
    },

    raid: (targetName: string) => {
        const state = MockContract.getState();
        const COST = 20;

        if (state.stamina < COST) {
            throw new Error(`Not enough Stamina (Need ${COST})`);
        }
        if (state.commandTokens < 10) {
            throw new Error("Insufficient Command Tokens (Need 10)");
        }

        state.stamina -= COST;
        state.commandTokens -= 10;

        // 70% win rate for demo
        const success = Math.random() < 0.7;
        if (success) {
            const loot = Math.floor(Math.random() * 50) + 10;
            state.commandTokens += loot;
            state.history.unshift(`⚔️ Raid on ${targetName} SUCCESSFUL! Stole ${loot} CMD (-${COST} Stamina)`);
        } else {
            state.history.unshift(`🛡️ Raid on ${targetName} FAILED. Lost 10 CMD (-${COST} Stamina)`);
        }
        MockContract.saveState(state);
        return state;
    },

    requestDrill: () => {
        const QUESTIONS = [
            { id: 1, q: "What consensus mechanism does Stellar use?", options: ["PoW", "PoS", "SCP", "PoH"], ans: "SCP" },
            { id: 2, q: "What is the native token of Soroban?", options: ["ETH", "XLM", "SOL", "USDC"], ans: "XLM" },
            { id: 3, q: "Which function authorizes a contract call?", options: ["require_auth", "check_sig", "validate", "sign"], ans: "require_auth" },
        ];
        return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    },

    submitDrill: (correct: boolean) => {
        const state = MockContract.getState();
        if (correct) {
            state.defense += 5;
            state.commandTokens += 50;
            state.history.unshift(`Tactical Drill Passed! +5 Defense, +50 CMD`);
        } else {
            state.stamina = Math.max(0, state.stamina - 5);
            state.history.unshift(`Drill Failed! -5 Stamina Penalty`);
        }
        MockContract.saveState(state);
        return state;
    }
};
