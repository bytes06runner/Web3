#![no_std]
use soroban_sdk::{Env};

pub struct Escrow;

impl Escrow {
    pub fn calculate_payout(_env: &Env, damage_percent: u32, loot_pool: i128) -> (i128, i128, i128) {
        // Returns (Raider, Platform, Defender)
        if damage_percent < 30 {
            return (0, 0, loot_pool);
        } else if damage_percent < 50 {
            // Breach: 30% destruction -> 20% pool
            let payout = (loot_pool * 20) / 100;
            let fee = (loot_pool * 2) / 100;
            return (payout, fee, loot_pool - payout - fee);
        } else if damage_percent < 100 {
             // Victory: 50% destruction -> 50% pool
            let payout = (loot_pool * 50) / 100;
            let fee = (loot_pool * 5) / 100;
            return (payout, fee, loot_pool - payout - fee);
        } else {
             // Wipeout: 100% destruction -> 90% pool
            let payout = (loot_pool * 90) / 100;
            let fee = (loot_pool * 10) / 100;
             return (payout, fee, loot_pool - payout - fee);
        }
    }
}
