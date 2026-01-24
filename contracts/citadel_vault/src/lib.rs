#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Principal(Address),  // User -> Amount
    Yield(Address),      // User -> Amount
    LastTs(Address),     // User -> Timestamp
    TotalPrincipal,
    TotalYield,
}

#[contract]
pub struct CitadelVault;

#[contractimpl]
impl CitadelVault {
    // Deposit Principal
    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();
        
        // Update Principal
        let key = DataKey::Principal(user.clone());
        let current: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        env.storage().persistent().set(&key, &(current + amount));
        
        // Update Start Time for Yield if new
        let ts_key = DataKey::LastTs(user.clone());
        if !env.storage().persistent().has(&ts_key) {
             env.storage().persistent().set(&ts_key, &env.ledger().timestamp());
        }
        
        // Update Global
        let total_key = DataKey::TotalPrincipal;
        let total: i128 = env.storage().instance().get(&total_key).unwrap_or(0);
        env.storage().instance().set(&total_key, &(total + amount));
    }

    // Accrue Yield (Simulated APY logic)
    pub fn accrue_yield(env: Env, user: Address) -> i128 {
        let principal_key = DataKey::Principal(user.clone());
        let principal: i128 = env.storage().persistent().get(&principal_key).unwrap_or(0);
        
        if principal == 0 { return 0; }

        let ts_key = DataKey::LastTs(user.clone());
        let last_ts: u64 = env.storage().persistent().get(&ts_key).unwrap_or(env.ledger().timestamp());
        let now = env.ledger().timestamp();
        
        if now <= last_ts { return 0; }
        
        let elapsed = (now - last_ts) as i128;
        let apy_bps = 1000; // 10% APY
        let seconds_in_year = 31536000;
        
        // Yield = Principal * APY * (Elapsed / Year)
        // Using large multiplier for precision
        let yield_amount = (principal * apy_bps * elapsed) / (10000 * seconds_in_year);
        
        // Update Storage
        let yield_key = DataKey::Yield(user.clone());
        let current_yield: i128 = env.storage().persistent().get(&yield_key).unwrap_or(0);
        env.storage().persistent().set(&yield_key, &(current_yield + yield_amount));
        
        // Update Timestamp
        env.storage().persistent().set(&ts_key, &now);
        
        yield_amount
    }
    
    // Getters
    pub fn get_balance(env: Env, user: Address) -> i128 {
        let key = DataKey::Principal(user);
        env.storage().persistent().get(&key).unwrap_or(0)
    }
    
    pub fn get_yield(env: Env, user: Address) -> i128 {
        let key = DataKey::Yield(user);
        env.storage().persistent().get(&key).unwrap_or(0)
    }
}
