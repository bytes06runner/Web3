use soroban_sdk::{contracttype, Address};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FitnessStats {
    pub user: Address,
    pub steps_today: u32,
    pub last_step_update: u64,
}

// Logic will be in the main contract impl, this file holds types.
