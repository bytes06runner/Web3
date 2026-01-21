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
    Training(Address), // Track user training status
    TotalYield, // Track protocol revenue
}

const SECONDS_PER_DAY: u64 = 86400;
const YIELD_RATE_BPS: i128 = 5; // 0.05% daily (approx 18% APY for game purposes)
const COMMAND_PER_YIELD: i128 = 10; // 10 Command tokens per 1 USDC yield

#[contractimpl]
impl YieldRaiders {
    // ... (Existing Vault & Yield code remains, omitted for brevity if using replace_chunk, but since we are doing logic add, see chunks below) ...
    // Note: I will use a separate replace call for adding functions to avoid messing up the whole file structure if not needed.
    // Ideally I should append functions.

    // --- TRAINING ---

    pub fn request_drill(env: Env, user: Address) -> u64 {
        user.require_auth();
        // In real app: Check cooldown in storage
        // Generate pseudo-random ID
        let drill_id = env.ledger().timestamp() % 5; // 5 questions pool
        
        // Return drill ID (client maps this to question text)
        drill_id
    }

    pub fn submit_drill(env: Env, user: Address, drill_id: u64, correct: bool) {
        user.require_auth();
        
        // Verify answer (simplified: client sends 'correct', in real app we check hash)
        if !correct {
            panic!("Incorrect answer! Security breach detected.");
        }

        let key = DataKey::Vault(user.clone());
        let mut vault: Vault = env.storage().persistent().get(&key).expect("Vault not found");

        // Reward
        vault.defense_power += 5;
        vault.command_balance += 50; 
        
        env.storage().persistent().set(&key, &vault);
    }
    
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
            stamina: 100,
        });

        // Claim pending yield before depositing
        // Note: In real app we'd fetch streak here too, assuming 0 for deposit for simplicity or fetching
        let pending_yield = Self::calculate_yield(&env, &vault, 0);
        vault.command_balance += pending_yield * COMMAND_PER_YIELD;
        
        vault.principal += amount;
        vault.last_yield_time = env.ledger().timestamp();
        
        env.storage().persistent().set(&key, &vault);
    }

    pub fn claim_yield(env: Env, user: Address) -> i128 {
        user.require_auth();
        let key = DataKey::Vault(user.clone());
        let mut vault: Vault = env.storage().persistent().get(&key).expect("Vault not found");

        // Fetch fitness stats for streak bonus
        let fitness_key = DataKey::Fitness(user.clone());
        let stats = env.storage().persistent().get::<DataKey, FitnessStats>(&fitness_key).unwrap_or(FitnessStats {
            user: user.clone(),
            steps_today: 0,
            last_step_update: 0,
            streak_days: 0,
        });

        let pending_yield = Self::calculate_yield(&env, &vault, stats.streak_days);
        let command_earned = pending_yield * COMMAND_PER_YIELD;
        
        vault.command_balance += command_earned;

        // Stamina Regen: 1 per 10 mins (approx 144 per day)
        // usage: (now - last_time) / 600
        let time_diff = env.ledger().timestamp() - vault.last_yield_time;
        let regen = (time_diff / 600) as u32;
        if regen > 0 {
             vault.stamina = core::cmp::min(100, vault.stamina + regen);
        }

        vault.last_yield_time = env.ledger().timestamp();
        
        env.storage().persistent().set(&key, &vault);
        
        command_earned
    }
    
    pub fn get_vault(env: Env, user: Address) -> Option<Vault> {
        env.storage().persistent().get(&DataKey::Vault(user))
    }

    fn calculate_yield(env: &Env, vault: &Vault, streak_days: u32) -> i128 {
        let time_diff = env.ledger().timestamp() - vault.last_yield_time;
        if time_diff < SECONDS_PER_DAY {
            return 0; // Simplify: daily yield only
        }
        let days = (time_diff / SECONDS_PER_DAY) as i128;
        
        // Base Rate + Streak Bonus (0.01% per streak day, max 10 days = 0.1%)
        // YIELD_RATE_BPS is 5 (0.05%). Let's add bonus.
        // Bonus BPS = min(streak, 10) * 10 (10 bps = 0.1%)
        let bonus_bps = (core::cmp::min(streak_days, 10) * 10) as i128;
        let total_rate = YIELD_RATE_BPS + bonus_bps;

        (vault.principal * total_rate * days) / 10000
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
            streak_days: 0,
        });

        // Reset if new day (simplified)
        let time_diff = env.ledger().timestamp() - stats.last_step_update;
        if time_diff > SECONDS_PER_DAY {
             // If strictly consecutive (within 48h?), keep streak, else reset
             // Simplified: Always increment if > 1000 steps and it's a new day
             if stats.steps_today >= 1000 {
                 stats.streak_days += 1;
             } else if time_diff > SECONDS_PER_DAY * 2 {
                 stats.streak_days = 0; // Lost streak
             }
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
        let raid_cost_cmd = 10;
        let raid_cost_stamina = 20;

        if attacker_vault.command_balance < raid_cost_cmd {
            panic!("Not enough Command tokens");
        }
        if attacker_vault.stamina < raid_cost_stamina {
            panic!("Not enough Stamina");
        }

        attacker_vault.command_balance -= raid_cost_cmd;
        attacker_vault.stamina -= raid_cost_stamina;

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
