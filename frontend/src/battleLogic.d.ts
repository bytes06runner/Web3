declare module '*/battleLogic' {
    export const UNIT_TYPES: {
        INFANTRY: string;
        ARCHER: string;
        CAVALRY: string;
    };
    export function calculateWinProbability(atk: number, def: number): number;
    export function getUnitBonus(attackerUnit: string, defenderUnit: string): number;
    export function calculateLoot(baseReward: number, atk: number, def: number): number;
}
