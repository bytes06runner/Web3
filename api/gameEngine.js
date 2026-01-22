/**
 * gameEngine.js
 * Handles passive regeneration and other time-based game mechanics.
 */

// Calculates and updates the user's capacity based on time elapsed and yield rate.
export function calculateRegen(user) {
    if (user.capacity === undefined || !user.lastCapacityUpdate) {
        user.capacity = user.capacity !== undefined ? user.capacity : 100;
        user.maxCapacity = user.maxCapacity !== undefined ? user.maxCapacity : 100;
        user.lastCapacityUpdate = new Date();
        return; // Initialize if missing
    }

    const now = new Date();
    const lastUpdate = new Date(user.lastCapacityUpdate);
    const elapsedSeconds = (now - lastUpdate) / 1000;

    if (elapsedSeconds <= 0) return;

    // Yield Logic: Base Rate + Bonus from Wins
    // Higher wins = Faster regeneration
    const baseRate = 0.5; // Starts at 0.5 capacity per second (example)
    const winBonus = (user.stats.wins || 0) * 0.1; 
    const regenRate = baseRate + winBonus;

    const regeneratedAmount = elapsedSeconds * regenRate;
    
    // Update Capacity
    let newCapacity = user.capacity + regeneratedAmount;
    
    // Cap at Max
    const maxCap = user.maxCapacity || 100;
    if (newCapacity > maxCap) {
        newCapacity = maxCap;
    }

    user.capacity = Math.floor(newCapacity); // Keep it integer for simplicity
    user.lastCapacityUpdate = now;
}

export default {
    calculateRegen
};
