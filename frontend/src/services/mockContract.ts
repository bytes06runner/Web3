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
    cavalry: number;
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
        cavalry: 0,
        giants: 0,
        trainingUntil: 0
    },

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

    
    trainTroops: (type: 'archers' | 'cavalry' | 'giants') => {
        const state = MockContract.getState();
        const cost = type === 'archers' ? 10 : type === 'cavalry' ? 25 : 50;
        
        if (state.commandTokens < cost) throw new Error("Not enough Command Tokens");
        
        state.commandTokens -= cost;
        
        // Simulating instant training for demo flow, or small delay could be added
        if (!state.troops) state.troops = { archers: 0, cavalry: 0, giants: 0, trainingUntil: 0 };
        
        state.troops[type] = (state.troops[type] || 0) + 1;
        state.history.unshift(`Trained ${type.toUpperCase()}`);
        
        MockContract.saveState(state);
        return state;
    },
    
    
    skipCooldown: () => {
        const state = MockContract.getState();
        state.cooldownUntil = 0;
        state.consecutiveWins = 0; // Reset counter too? Usually yes if paid.
        state.history.unshift("⏩ Cooldown Skipped (Paid).");
        MockContract.saveState(state);
        return state;
    },
    refillStrength: () => {
        // This simulates the paid transaction callback
        const state = MockContract.getState();
        state.stamina = 100;
        state.history.unshift("⚡ Strength Refilled (Paid).");
        MockContract.saveState(state);
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

        // --- STAMINA/CAPACITY CHECK ---
        const STAMINA_COST = 10;
        if (state.stamina < STAMINA_COST) throw new Error("Insufficient Stamina!");
        state.stamina -= STAMINA_COST;

        // --- COMBAT STATS CALCULATOR ---
        // Attacker Power = Base Troop * (Troops trained)
        // For simplified MVP, we use the `troopCount` param passed from UI (or 10) PLUS trained troops bonus
        
        let archerPower = (state.troops?.archers || 0) * 5;
        let cavalryPower = (state.troops?.cavalry || 0) * 15;
        let giantPower = (state.troops?.giants || 0) * 50;
        
        let totalAttack = (troopCount * 15) + archerPower + cavalryPower + giantPower;
        
        // Defender Stats (Simulated)
        const defWall = defenderStats.wallHp || 1000;
        const defArmy = defenderStats.armyHp || 500;
        const defTownhall = defenderStats.townhallHp || 2000;
        
        let logMsg = `⚔️ RAID INITIATED! Power: ${totalAttack}`;
        let currentDmg = totalAttack;
        let phase = "";
        let destruction = 0;
        
        // --- PHASE 1: WALL ---
        let dmgWall = Math.min(currentDmg, defWall);
        currentDmg -= dmgWall;
        logMsg += `
🧱 WALL: Dealt ${dmgWall} DMG.`;
        
        if (currentDmg <= 0) {
            phase = "Wall";
            destruction = (dmgWall / (defWall + defArmy + defTownhall)) * 100;
            logMsg += ` Attack Stopped at Wall.`;
        } else {
             // --- PHASE 2: ARMY ---
             logMsg += ` WALL BREACHED!`;
             let dmgArmy = Math.min(currentDmg, defArmy);
             currentDmg -= dmgArmy;
             logMsg += `
🛡️ DEFENSE ARMY: Dealt ${dmgArmy} DMG.`;
             
             if (currentDmg <= 0) {
                 phase = "Army";
                 destruction = ((defWall + dmgArmy) / (defWall + defArmy + defTownhall)) * 100;
                 logMsg += ` Attack Stopped by Army.`;
             } else {
                 // --- PHASE 3: TOWNHALL ---
                 logMsg += ` ARMY DEFEATED!`;
                 let dmgTownhall = Math.min(currentDmg, defTownhall);
                 // Bonus Dmg to structure
                 dmgTownhall *= 1.5; 
                 
                 phase = "Townhall";
                 destruction = ((defWall + defArmy + dmgTownhall) / (defWall + defArmy + defTownhall)) * 100;
                 logMsg += `
🏰 TOWNHALL: Dealt ${dmgTownhall.toFixed(0)} DMG.`;
                 
                 if (dmgTownhall >= defTownhall) {
                     logMsg += ` BASE DESTROYED!`;
                     destruction = 100;
                 }
             }
        }
        
        let success = destruction > 30; // Win condition
        
        // Escrow Payout Logic
        let reward = 0;
        if (destruction >= 100) reward = 200; // 2x Wager (Simulated 100 wager)
        else if (destruction >= 30) reward = 50 + Math.floor(destruction); // Partial
        
        if (success) {
            state.consecutiveWins = (state.consecutiveWins || 0) + 1;
            if (state.consecutiveWins >= 5) {
                state.cooldownUntil = Date.now() + 10000;
                state.consecutiveWins = 0;
                logMsg += " (💤 Fatigue: 10s Cooldown)";
            }
            state.commandTokens += reward * 5;
            state.yieldEarned += reward;
            logMsg += `
💰 LOOT: ${reward} XLM`;
        } else {
            state.consecutiveWins = 0;
            logMsg += `
❌ RAID FAILED. Defense Held.`;
        }

        state.history.unshift(logMsg.split('
')[0]); // Summary only for feed
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
