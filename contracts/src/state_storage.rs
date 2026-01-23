#![no_std]
use soroban_sdk::{contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Base {
    pub owner: Address,
    pub level: u32,
    pub balance: i128, // XLM stored in escrow
    pub wall_hp: u32,
    pub max_wall_hp: u32,
    pub troop_level: u32, // Defender troop level
    pub troop_count: u32, // Defender troop count (garrison)
    pub max_troops: u32,
    pub last_claim_time: u64,
    pub shield_end_time: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TroopStats {
    pub damage: u32,
    pub stamina: u32,
}

#[contracttype]
pub enum DataKey {
    Base(Address),
    TotalYield, // Platform revenue
    UserTroop(Address), // Attacker troop stats if stored separately
}

pub fn get_base(env: &Env, user: Address) -> Option<Base> {
    env.storage().persistent().get(&DataKey::Base(user))
}

pub fn set_base(env: &Env, user: Address, base: &Base) {
    env.storage().persistent().set(&DataKey::Base(user), base);
}

pub fn get_troop_stats(level: u32) -> TroopStats {
    match level {
        1 => TroopStats { damage: 5, stamina: 20 },
        2 => TroopStats { damage: 10, stamina: 30 },
        3 => TroopStats { damage: 15, stamina: 45 },
        _ => TroopStats { damage: 5 + (level * 5), stamina: 20 + (level * 10) },
    }
}
