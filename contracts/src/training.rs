use soroban_sdk::{contracttype, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Drill {
    pub id: u64,
    pub question_hash: String, // In real app, hash of question ID
    pub difficulty: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TrainingStatus {
    Ready,
    Active(Drill),
    Cooldown(u64), // Timestamp
}
