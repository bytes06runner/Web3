#![no_std]
use crate::state_storage::{Base, TroopStats};
use soroban_sdk::{Env};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum BattlePhase {
    Breach,
    Ambush,
    End,
}

pub struct BattleResult {
    pub success: bool,
    pub destruction_percent: u32,
    pub phase: BattlePhase,
    pub remaining_stamina: u32,
}

pub fn simulate_raid(
    _env: &Env, 
    base: &Base, 
    attacker_troops: u32, 
    attacker_stats: &TroopStats,
    defender_stats: &TroopStats
) -> BattleResult {
    
    // Phase 1: Breach
    let total_potential = (attacker_troops as u64) * (attacker_stats.stamina as u64) * (attacker_stats.damage as u64);
    
    if total_potential < (base.wall_hp as u64) {
        // Failed Breach
        return BattleResult {
            success: false,
            destruction_percent: 0,
            phase: BattlePhase::Breach,
            remaining_stamina: 0,
        };
    }
    
    // Stamina consumed = (Wall HP / DMG)
    // Avoid divide by zero
    let dmg = if attacker_stats.damage == 0 { 1 } else { attacker_stats.damage };
    let stamina_consumed = (base.wall_hp + dmg - 1) / dmg;
    
    let total_stamina_pool = attacker_troops * attacker_stats.stamina;
    
    // This check is redundant if total_potential check passes, but good for safety
    if (stamina_consumed as u64) > (total_stamina_pool as u64) {
         return BattleResult {
            success: false,
            destruction_percent: 0,
            phase: BattlePhase::Breach,
            remaining_stamina: 0,
        };
    }
    
    let remaining_pool = total_stamina_pool - stamina_consumed;
    
    // Phase 2: Ambush
    let defender_power = (base.troop_count as u64) * (defender_stats.damage as u64) * (defender_stats.stamina as u64);
    
    // Attacker remaining damage potential
    let attacker_remaining_damage = (remaining_pool as u64) * (attacker_stats.damage as u64);
    
    if attacker_remaining_damage > defender_power {
        // Attacker wins Ambush (50%+)
        // Assuming Wipeout (100%) if significant overkill, else just Victory (50%)
        // Let's say if remaining damage > defender power * 1.5 => 100%
        let destruction = if attacker_remaining_damage > (defender_power * 3 / 2) { 100 } else { 50 };
        return BattleResult {
            success: true,
            destruction_percent: destruction,
            phase: BattlePhase::End,
            remaining_stamina: ((attacker_remaining_damage - defender_power) / (dmg as u64)) as u32,
        };
    } else {
        // Defender wins Ambush
        return BattleResult {
            success: true, 
            destruction_percent: 30, // Breached but stopped
            phase: BattlePhase::Ambush,
            remaining_stamina: 0,
        };
    }
}
