#![no_std]

mod vault;
mod battle;
mod fitness;

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec, symbol_short};
use vault::Vault;
use battle::{BattleRecord, BattleOutcome};
use fitness::FitnessStats;

#[contract]
pub struct YieldRaiders;

#[contracttype]
pub enum DataKey {
    Vault(Address),
    Fitness(Address),
    TotalYield, // Track protocol revenue
}

const SECONDS_PER_DAY: u64 = 86400;
const YIELD_RATE_BPS: i128 = 5; // 0.05% daily (approx 18% APY for game purposes)
const COMMAND_PER_YIELD: i128 = 10; // 10 Command tokens per 1 USDC yield

#[contractimpl]
impl YieldRaiders {
    // --- VAULT & YIELD ---

    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();
        
        let key = DataKey::Vault(user.clone());
        let mut vault = env.storage().persistent().get(&key).unwrap_or(Vault {
            owner: user.clone(),
            principal: 0,
            command_balance: 0,
            last_yield_time: env.ledger().timestamp(),
            defense_power: 100, // Base defense
            total_steps: 0,
        });

        // Claim pending yield before depositing
        let pending_yield = Self::calculate_yield(&env, &vault);
        vault.command_balance += pending_yield * COMMAND_PER_YIELD;
        
        vault.principal += amount;
        vault.last_yield_time = env.ledger().timestamp();
        
        env.storage().persistent().set(&key, &vault);
    }

    pub fn claim_yield(env: Env, user: Address) -> i128 {
        user.require_auth();
        let key = DataKey::Vault(user.clone());
        let mut vault: Vault = env.storage().persistent().get(&key).expect("Vault not found");

        let pending_yield = Self::calculate_yield(&env, &vault);
        let command_earned = pending_yield * COMMAND_PER_YIELD;
        
        vault.command_balance += command_earned;
        vault.last_yield_time = env.ledger().timestamp();
        
        env.storage().persistent().set(&key, &vault);
        
        command_earned
    }
    
    pub fn get_vault(env: Env, user: Address) -> Option<Vault> {
        env.storage().persistent().get(&DataKey::Vault(user))
    }

    fn calculate_yield(env: &Env, vault: &Vault) -> i128 {
        let time_diff = env.ledger().timestamp() - vault.last_yield_time;
        if time_diff < SECONDS_PER_DAY {
            return 0; // Simplify: daily yield only
        }
        let days = (time_diff / SECONDS_PER_DAY) as i128;
        // Simple interest for game mechanics: Principal * Rate * Days
        (vault.principal * YIELD_RATE_BPS * days) / 10000
    }

    // --- FITNESS ---

    pub fn record_steps(env: Env, user: Address, steps: u32) {
        // In reality, this would be authenticated by an Oracle node
        // For hackathon/demo, we allow self-reporting or any caller
        // user.require_auth(); // Or oracle auth
        
        let key = DataKey::Fitness(user.clone());
        let mut stats = env.storage().persistent().get(&key).unwrap_or(FitnessStats {
            user: user.clone(),
            steps_today: 0,
            last_step_update: env.ledger().timestamp(),
        });

        // Reset if new day (simplified)
        let time_diff = env.ledger().timestamp() - stats.last_step_update;
        if time_diff > SECONDS_PER_DAY {
            stats.steps_today = 0;
        }

        stats.steps_today += steps;
        stats.last_step_update = env.ledger().timestamp();
        
        env.storage().persistent().set(&key, &stats);

        // Update Vault with fitness boost
        let vault_key = DataKey::Vault(user.clone());
        if let Some(mut vault) = env.storage().persistent().get::<DataKey, Vault>(&vault_key) {
            vault.total_steps += steps;
            // Bonus: 1 Command per 1000 steps
            let bonus = (steps / 1000) as i128;
            if bonus > 0 {
                vault.command_balance += bonus;
                env.storage().persistent().set(&vault_key, &vault);
            }
        }
    }

    // --- BATTLE ---

    pub fn raid(env: Env, attacker: Address, defender: Address) -> BattleOutcome {
        attacker.require_auth();
        
        let attacker_key = DataKey::Vault(attacker.clone());
        let defender_key = DataKey::Vault(defender.clone());
        
        let mut attacker_vault: Vault = env.storage().persistent().get(&attacker_key).expect("Attacker has no vault");
        let mut defender_vault: Vault = env.storage().persistent().get(&defender_key).expect("Defender has no vault");

        // Raid Cost
        let raid_cost = 10;
        if attacker_vault.command_balance < raid_cost {
            panic!("Not enough Command tokens");
        }
        attacker_vault.command_balance -= raid_cost;

        // Battle Logic: Simple comparison plus RNG simulated by time
        // Power = Base Defense + (Steps / 100)
        let attack_power = attacker_vault.defense_power + (attacker_vault.total_steps / 100);
        let defense_power = defender_vault.defense_power + (defender_vault.total_steps / 100);
        
        // Pseudo-random factor using timestamp
        let luck = (env.ledger().timestamp() % 50) as u32; // 0-49 bonus
        
        let outcome = if attack_power + luck > defense_power {
            // Victory: Steal 20% of yield-equivalent in Command tokens
            let loot = (defender_vault.command_balance * 20) / 100;
            defender_vault.command_balance -= loot;
            attacker_vault.command_balance += loot;
            BattleOutcome::Victory
        } else {
            BattleOutcome::Defeat
        };

        // Save states
        env.storage().persistent().set(&attacker_key, &attacker_vault);
        env.storage().persistent().set(&defender_key, &defender_vault);
        
        outcome
    }
}
