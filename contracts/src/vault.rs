use soroban_sdk::{contracttype, Address};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Vault {
    pub owner: Address,
    pub principal: i128,        // USDC deposited (mock)
    pub command_balance: i128,  // Earned $COMMAND tokens
    pub last_yield_time: u64,   // Timestamp of last yield claim
    pub defense_power: u32,     // Base defense
    pub total_steps: u32,       // Integrated fitness stat
}

// In a real app we'd map Address -> Vault
// For this single-contract demo, we'll keep types here.
