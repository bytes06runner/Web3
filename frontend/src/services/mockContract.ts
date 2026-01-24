// @ts-nocheck
import { StellarService } from './stellarService';

const STORAGE_KEY = 'yield_raiders_state';

interface BaseState {
    level: number;
    wallHp: number;
    armyHp: number;
    townhallHp: number;
    maxWallHp: number;
    maxArmyHp: number;
    maxTownhallHp: number;
}

interface TroopQueue {
    archers: number;
    infantry: number;
    giants: number;
    trainingUntil: number;
}

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
    base: BaseState;
    troops: TroopQueue;
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
    cooldownUntil: 0,
    base: {
        level: 1,
        wallHp: 1000,
        armyHp: 500,
        townhallHp: 2000,
        maxWallHp: 1000,
        maxArmyHp: 500,
        maxTownhallHp: 2000
    },
    troops: {
        archers: 0,
        infantry: 0,
        giants: 0,
        trainingUntil: 0
    }
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
                // state.history.unshift(`Claimed Yield + ${(yieldAmount * 10).toFixed(2)} CMD`);
            }
            MockContract.saveState(state);
        }
        return state;
    },

    // V3 Training
    trainTroops: (type: 'archers' | 'infantry' | 'giants') => {
        const state = MockContract.getState();
        const troops = state.troops || { archers: 0, infantry: 0, giants: 0, trainingUntil: 0 };
        
        const RULES = {
            archers: { cost: 5, limit: 4 },
            infantry: { cost: 10, limit: 3 },
            giants: { cost: 20, limit: 3 }
        };
        
        const unit = RULES[type];
        if (!unit) throw new Error("Invalid Unit Type");
        
        if ((troops[type] || 0) >= unit.limit) {
            throw new Error(`Max ${unit.limit} ${type} allowed!`);
        }
        
        const usedCapacity = (troops.archers * 5) + (troops.infantry * 10) + (troops.giants * 20);
        if (usedCapacity + unit.cost > 100) {
            throw new Error(`Insufficient Capacity! (${usedCapacity}/100)`);
        }
        
        troops[type] = (troops[type] || 0) + 1;
        state.troops = troops;
        
        state.history.unshift(`Trained ${type.toUpperCase()} (Occupy ${unit.cost} Cap)`);
        MockContract.saveState(state);
        return state;
    },

    refillStrength: () => {
        const state = MockContract.getState();
        state.stamina = 100;
        state.history.unshift("⚡ Strength Refilled (Paid).");
        MockContract.saveState(state);
        return state;
    },
    
    skipCooldown: () => {
        const state = MockContract.getState();
        state.cooldownUntil = 0;
        state.consecutiveWins = 0;
        state.history.unshift("⏩ Cooldown Skipped (Paid).");
        MockContract.saveState(state);
        return state;
    },

    recordSteps: (steps: number) => {
        const state = MockContract.getState();
        state.stepCount += steps;
        MockContract.saveState(state);
        return state;
    },

    // V3 Raid Logic
    raid: async (targetName: string, userPublicKey: string, troopCount: number = 0, defenderStats: any = { defense: 50 }) => {
        const state = MockContract.getState();
        const troops = state.troops || { archers: 0, infantry: 0, giants: 0 };
        
        const dps = (troops.archers * 3) + (troops.infantry * 5) + (troops.giants * 7);
        const defenderDefense = defenderStats.defense || 50;
        
        let logMsg = `⚔️ RAID (STAKED 100 XLM)\nArmy DPS: ${dps} vs Defense: ${defenderDefense}`;
        
        const success = dps > defenderDefense;
        let destruction = 0;
        let reward = 0;
        let phase = "Wall"; // Fallback phase logic
        
        // Pseudo-phase for visualization compatibility
        if (dps > defenderDefense * 0.3) phase = "Army";
        if (dps > defenderDefense * 0.8) phase = "Townhall";

        if (success) {
            const margin = dps - defenderDefense;
            destruction = Math.min(100, 50 + (margin * 5));
            phase = "Townhall";
            
            const stakeRefund = Math.floor(100 * (destruction / 100));
            const loot = 20; 
            reward = stakeRefund + loot;
            
            logMsg += `\n✅ VICTORY! Destruction: ${destruction.toFixed(0)}%`;
            logMsg += `\n💰 RECOVERED: ${stakeRefund} XLM + LOOT: ${loot} XLM`;
            
            state.consecutiveWins = (state.consecutiveWins || 0) + 1;
            
            if (state.consecutiveWins >= 5) {
                state.cooldownUntil = Date.now() + 60000; // 1 min cooldown
                logMsg += "\n(💤 Army Resting 60s)";
            }

            state.commandTokens += 50; 
            state.yieldEarned += reward;
        } else {
            logMsg += `\n❌ DEFEAT. Invaders wiped out.`;
            logMsg += `\n💸 LOST STAKE: 100 XLM`;
            state.consecutiveWins = 0;
        }
        
        state.troops = { archers: 0, infantry: 0, giants: 0, trainingUntil: 0 };
        logMsg += `\n📉 Units Deployed & Consumed.`;

        state.history.unshift(logMsg.split('\n')[0]);
        MockContract.saveState(state);
        
        return { success, reward, destruction, log: logMsg, phase };
    },

    upgradeDefense: () => {
        const state = MockContract.getState();
        state.defense += 5;
        state.history.unshift(`🛡️ Defense Upgraded to ${state.defense}`);
        MockContract.saveState(state);
        return state;
    },

    requestDrill: async () => {},
    submitDrill: async () => {}
};
