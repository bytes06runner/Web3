/**
 * gameEngine.js
 * Handles passive regeneration and other time-based game mechanics.
 */

// Calculates and updates the user's capacity based on time elapsed.
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

    // Yield Logic: Fixed 1% every 3 seconds
    // 100% capacity takes 300 seconds (5 minutes)
    const regenRate = 1 / 3; // 0.3333 capacity per second

    const regeneratedAmount = elapsedSeconds * regenRate;
    
    // Update Capacity
    let newCapacity = user.capacity + regeneratedAmount;
    
    // Cap at Max
    const maxCap = user.maxCapacity || 100;
    if (newCapacity > maxCap) {
        newCapacity = maxCap;
    }

    // Keep decimal precision for smooth regen across short polling intervals
    user.capacity = newCapacity; 
    user.lastCapacityUpdate = now;
}

export default {
    calculateRegen
};
