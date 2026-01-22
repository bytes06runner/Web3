import connectToDatabase from './db.js';
import User from './models/User.js';
import { calculateWinProbability, calculateLoot, getUnitBonus } from './battleLogic.js';
import { calculateRegen } from './gameEngine.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const { attackerWallet, defenderUsername } = request.body;

  if (!attackerWallet || !defenderUsername) {
    return response.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await connectToDatabase();

    // Find Attacker
    const attacker = await User.findOne({ walletAddress: attackerWallet });
    if (!attacker) {
      return response.status(404).json({ message: 'Attacker not found' });
    }

    // Find Defender
    const defender = await User.findOne({ username: defenderUsername });
    if (!defender) {
      return response.status(404).json({ message: 'Defender not found' });
    }

    // --- REGENERATION & CAPACITY CHECK ---
    calculateRegen(attacker);
    
    // Ensure sufficient capacity
    if (attacker.capacity < 10) {
        return response.status(400).json({ 
            message: 'Insufficient Capacity (Troops Power). Wait for regeneration.',
            capacity: attacker.capacity
        });
    }

    // Deduct Cost (10)
    attacker.capacity -= 10;

    // --- BATTLE LOGIC ---
    
    // 1. Calculate Unit Advantage
    const atkUnit = attacker.unitType || 'Infantry';
    const defUnit = defender.unitType || 'Infantry';
    const unitMultiplier = getUnitBonus(atkUnit, defUnit);

    // 2. Adjust Attack Power
    const baseAtk = (attacker.stats.wins * 5) + 100;
    const adjustedAtk = baseAtk * unitMultiplier;
    const defenderDef = defender.stats.defense || 50;

    // 3. Win Probability (Sigmoid)
    const winProb = calculateWinProbability(adjustedAtk, defenderDef);
    
    // 4. Roll the Dice
    const roll = Math.random();
    const isWin = roll < winProb;

    // 5. Calculate Loot (Logarithmic)
    const baseLoot = 10;
    const lootAmount = isWin ? calculateLoot(baseLoot, adjustedAtk, defenderDef) : 0;

    if (isWin) {
        // --- WIN CONSEQUENCES ---
        
        // Attacker Gains
        attacker.stats.wins = (attacker.stats.wins || 0) + 1;
        attacker.stats.streak = (attacker.stats.streak || 0) + 1;
        attacker.balance = (attacker.balance || 1000) + lootAmount;
        
        // Defender Losses
        defender.lastRaidTime = new Date();
        defender.stats.defense = Math.max(0, (defender.stats.defense || 0) - 10);
        defender.balance = Math.max(0, (defender.balance || 1000) - lootAmount);
        
        await defender.save();
    } else {
        // --- LOSS CONSEQUENCES ---
        
        // Attacker Penalties
        attacker.stats.streak = 0;
        // Lose extra capacity (2x cost, so 10 already deducted + 10 more)
        attacker.capacity = Math.max(0, attacker.capacity - 10);
    }

    // Save Attacker state (regenerated capacity + results)
    await attacker.save();

    return response.status(200).json({ 
        message: isWin ? 'Raid Successful' : 'Raid Failed', 
        success: isWin,
        winProbability: winProb,
        unitAdvantage: unitMultiplier > 1.0,
        loot: lootAmount,
        newStats: attacker.stats,
        newCapacity: attacker.capacity,
        newBalance: attacker.balance
    });

  } catch (error) {
    console.error('Update Error:', error);
    return response.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
