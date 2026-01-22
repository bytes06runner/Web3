export const UNIT_TYPES = {
  INFANTRY: 'Infantry',
  ARCHER: 'Archer',
  CAVALRY: 'Cavalry'
};

/**
 * Calculates win probability using a Sigmoid function.
 * P(Win) = 1 / (1 + e^(-0.1 * (ATK - DEF)))
 * @param {number} atk - Attacker's Attack Power
 * @param {number} def - Defender's Defense Power
 * @returns {number} Probability between 0 and 1
 */
export function calculateWinProbability(atk, def) {
  const k = 0.1; // Steepness of the curve
  const diff = atk - def;
  return 1 / (1 + Math.exp(-k * diff));
}

/**
 * Calculates strategic bonus multiplier based on Unit Types.
 * Logic: Infantry > Archers > Cavalry > Infantry
 * @param {string} attackerUnit 
 * @param {string} defenderUnit 
 * @returns {number} Multiplier (1.2 or 1.0)
 */
export function getUnitBonus(attackerUnit, defenderUnit) {
  if (!attackerUnit || !defenderUnit) return 1.0;
  
  const rules = {
    [UNIT_TYPES.INFANTRY]: UNIT_TYPES.ARCHER,
    [UNIT_TYPES.ARCHER]: UNIT_TYPES.CAVALRY,
    [UNIT_TYPES.CAVALRY]: UNIT_TYPES.INFANTRY
  };

  if (rules[attackerUnit] === defenderUnit) {
    return 1.2; // +20% Advantage
  }
  return 1.0;
}

/**
 * Calculates loot using a Logarithmic scale to prevent economy draining.
 * Loot = Base * log10(1 + Difference/10)
 * @param {number} baseReward - Standard reward unit
 * @param {number} atk 
 * @param {number} def 
 * @returns {number} Calculated loot amount
 */
export function calculateLoot(baseReward, atk, def) {
    // Ensure positive difference for log calculation, min 0
    const diff = Math.max(0, atk - def); 
    // Log10(1 + x) ensures diminishing returns for massive power gaps
    const multiplier = Math.log10(1 + (diff / 10)) + 1; 
    return Math.floor(baseReward * multiplier);
}
