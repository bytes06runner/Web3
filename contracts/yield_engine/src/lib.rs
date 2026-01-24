#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Cooldown(Address), // User -> EndTimestamp
}

#[contract]
pub struct YieldEngine;

#[contractimpl]
impl YieldEngine {
    
    // Check and Enforce Cooldown
    pub fn check_cooldown(env: Env, user: Address) {
        let key = DataKey::Cooldown(user.clone());
        let end_ts: u64 = env.storage().persistent().get(&key).unwrap_or(0);
        let now = env.ledger().timestamp();
        
        if now < end_ts {
            panic!("YieldEngine: Cooldown Active! Army is Resting.");
        }
    }
    
    // Trigger Cooldown
    pub fn trigger_cooldown(env: Env, user: Address) {
        user.require_auth();
        let key = DataKey::Cooldown(user.clone());
        // 10 seconds cooldown
        let now = env.ledger().timestamp();
        let end_ts = now + 10; 
        env.storage().persistent().set(&key, &end_ts);
    }

    // Redistribute Yield (Simulation of Logic)
    // In a real integration, this would call CitadelVault to move yield
    pub fn redistribute_yield(env: Env, _attacker: Address, _victim: Address, amount: i128) {
        // Logic to move yield from victim's Yield balance to attacker's Yield balance
        // Simplified for this scope: Just emitting event or assume cross-contract call
        env.events().publish(
            (_attacker, _victim), 
            amount
        );
    }
}
