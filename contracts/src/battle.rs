use soroban_sdk::{contracttype, Address};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BattleRecord {
    pub attacker: Address,
    pub defender: Address,
    pub timestamp: u64,
    pub outcome: BattleOutcome,
    pub loot: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum BattleOutcome {
    Victory,
    Defeat,
}
