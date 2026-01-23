#![no_std]

mod vault;
mod battle;
mod fitness;
mod state_storage;
mod escrow_manager;
mod contract_engine;

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};
use state_storage::{Base, TroopStats, get_base, set_base, get_troop_stats};
use contract_engine::{simulate_raid, BattleResult, BattlePhase};
use escrow_manager::Escrow;

#[contract]
pub struct YieldRaiders;

#[contractimpl]
impl YieldRaiders {
    
    pub fn initialize(env: Env, user: Address) {
        user.require_auth();
        if get_base(&env, user.clone()).is_none() {
            let base = Base {
                owner: user.clone(),
                level: 1,
                balance: 1000, // Starting balance bonus for demo
                wall_hp: 100,
                max_wall_hp: 100,
                troop_level: 1,
                troop_count: 10, // Starting troops
                max_troops: 100,
                last_claim_time: env.ledger().timestamp(),
                shield_end_time: 0,
            };
            set_base(&env, user, &base);
        }
    }

    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();
        let mut base = get_base(&env, user.clone()).expect("Base not initialized");
        base.balance += amount;
        set_base(&env, user, &base);
    }
    
    pub fn upgrade_base(env: Env, user: Address) {
        user.require_auth();
        let mut base = get_base(&env, user.clone()).expect("Base not initialized");
        
        let cost = (base.level as i128) * 100;
        if base.balance < cost {
            panic!("Insufficient funds for upgrade");
        }
        
        base.balance -= cost;
        base.level += 1;
        base.max_troops += 50; 
        base.max_wall_hp += 100;
        base.wall_hp = base.max_wall_hp;
        
        set_base(&env, user, &base);
    }
    
    pub fn create_troops(env: Env, user: Address, amount: u32) {
        user.require_auth();
        let mut base = get_base(&env, user.clone()).expect("Base not initialized");
        
        let cost_per_unit: i128 = 10; 
        let total_cost = (amount as i128) * cost_per_unit;
        
        if base.balance < total_cost {
             panic!("Insufficient funds");
        }
        if base.troop_count + amount > base.max_troops {
             panic!("Garrison full");
        }
        
        base.balance -= total_cost;
        base.troop_count += amount;
        
        set_base(&env, user, &base);
    }

    pub fn raid(env: Env, attacker: Address, defender: Address, troop_count: u32) -> BattleResult {
        attacker.require_auth();
        
        let mut base_attacker = get_base(&env, attacker.clone()).expect("Attacker base not found");
        let mut base_defender = get_base(&env, defender.clone()).expect("Defender base not found");
        
        if env.ledger().timestamp() < base_defender.shield_end_time {
             panic!("Defender is shielded");
        }
        
        if base_attacker.troop_count < troop_count {
             panic!("Not enough troops");
        }
        
        let att_stats = get_troop_stats(base_attacker.troop_level);
        let def_stats = get_troop_stats(base_defender.troop_level);
        
        let result = simulate_raid(&env, &base_defender, troop_count, &att_stats, &def_stats);
        
        if result.success {
            let loot_pool = (base_defender.balance * 20) / 100;
            let (raider_share, fee, _) = Escrow::calculate_payout(&env, result.destruction_percent, loot_pool);
            
            base_defender.balance -= (raider_share + fee);
            base_attacker.balance += raider_share;
            
             if result.phase == BattlePhase::Breach {
                  base_defender.wall_hp = 0; 
             } else {
                  base_defender.wall_hp = 0;
             }
        } else {
             let total_potential = (troop_count as u64) * (att_stats.stamina as u64) * (att_stats.damage as u64);
             let damage = total_potential as u32;
             if damage >= base_defender.wall_hp {
                 base_defender.wall_hp = 0;
             } else {
                 base_defender.wall_hp -= damage;
             }
        }
        
        if result.destruction_percent == 100 {
             base_attacker.troop_count -= troop_count / 10; 
        } else if result.destruction_percent >= 30 {
             base_attacker.troop_count -= troop_count / 2;
        } else {
             base_attacker.troop_count -= troop_count;
        }
        
        if result.destruction_percent >= 30 {
             base_defender.shield_end_time = env.ledger().timestamp() + 300; 
        }
        
        set_base(&env, attacker, &base_attacker);
        set_base(&env, defender, &base_defender);
        
        result
    }
    
     pub fn get_my_base(env: Env, user: Address) -> Option<Base> {
        get_base(&env, user)
    }
}
