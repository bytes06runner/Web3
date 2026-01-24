#![no_std]
use soroban_sdk::{contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Debug)]
pub struct BaseState {
    pub level: u32,
    pub wall_hp: u32,
    pub army_hp: u32,
    pub townhall_hp: u32,
}

pub fn get_base_stats(env: &Env, user: Address) -> BaseState {
    // In a real contract, fetch from storage. Returning default for interface.
    BaseState {
        level: 1,
        wall_hp: 1000,
        army_hp: 500,
        townhall_hp: 2000,
    }
}

pub fn upgrade_base(env: &Env, user: Address, resource_spent: i128) {
    user.require_auth();
    // Logic to consume resource and boost HP stats
}
