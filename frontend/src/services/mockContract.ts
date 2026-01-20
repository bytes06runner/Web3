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
}

const INITIAL_STATE: GameState = {
    principal: 0,
    commandTokens: 50, // Starter bonus
    yieldEarned: 0,
    stepCount: 0,
    lastYieldTime: Date.now(),
    defense: 100,
    history: ['Welcome to Yield Raiders! Deposit USDC to start earning.']
};

export const MockContract = {
    getState: (): GameState => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : INITIAL_STATE;
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
        // Simulate real-time yield update (fast forward for demo)
        // 5% APY => 5/365/24/60 per minute approx.
        // For demo: 1% per minute
        const elapsedSeconds = (now - state.lastYieldTime) / 1000;
        const yieldAmount = (state.principal * 0.01 * elapsedSeconds) / 60;

        if (yieldAmount > 0) {
            state.yieldEarned += yieldAmount;
            // 10 Command tokens per $1 yield
            state.commandTokens += yieldAmount * 10;
            state.lastYieldTime = now;
            state.history.unshift(`Claimed $${yieldAmount.toFixed(4)} Yield + ${(yieldAmount * 10).toFixed(2)} CMD`);
            MockContract.saveState(state);
        }
        return state;
    },

    recordSteps: (steps: number) => {
        const state = MockContract.getState();
        state.stepCount += steps;
        // Bonus tokens
        const bonus = Math.floor(steps / 100);
        if (bonus > 0) {
            state.commandTokens += bonus;
            state.defense += Math.floor(bonus / 2);
            state.history.unshift(`Walked ${steps} steps! Earned ${bonus} CMD & Defense Boost`);
        }
        MockContract.saveState(state);
        return state;
    },

    raid: (targetName: string) => {
        const state = MockContract.getState();
        if (state.commandTokens < 10) {
            throw new Error("Insufficient Command Tokens (Need 10)");
        }
        state.commandTokens -= 10;

        // 70% win rate for demo
        const success = Math.random() < 0.7;
        if (success) {
            const loot = Math.floor(Math.random() * 50) + 10;
            state.commandTokens += loot;
            state.history.unshift(`⚔️ Raid on ${targetName} SUCCESSFUL! Stole ${loot} CMD`);
        } else {
            state.history.unshift(`🛡️ Raid on ${targetName} FAILED. Lost 10 CMD`);
        }
        MockContract.saveState(state);
        return state;
    }
};
