# Yield Raiders - Project Documentation

**Yield Raiders** is a Gamified DeFi (GameFi) application built on the **Stellar Network**. It combines financial yield mechanics with RPG-style gameplay, allowing users to earn yield on their crypto assets while using that yield to "power" their in-game character for raids and battles.

> **Live Deployment**: [Vercel App Link] (Add your link here)

---

## 🏗 Architecture

The project follows a modern **Hybrid Web3 Architecture**:

### 1. Frontend (Client)
- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/) (Fast & Lightweight).
- **Language**: TypeScript (Type safety).
- **Styling**: Tailwind CSS (Utility-first styling).
- **Blockchain Interaction**: `freighter-api` (Wallet connection) & `stellar-sdk`.

### 2. Backend (Serverless)
- **Platform**: Vercel Serverless Functions (Node.js).
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (User profiles, Stats, Authentication).
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (Dynamic Puzzle Generation).

### 3. Blockchain (Stellar)
- **Network**: Stellar Testnet / Futurenet.
- **Smart Contracts**: Soroban (Rust) - *Mocked for MVP in `MockContract.ts` for smooth UI flows, ready for actual contract integration.*

---

## 🚀 Key Features

### 1. 🔐 Authentication & Profile
- **Secure Registration**: Users create accounts linked to their **Stellar Wallet Address**.
- **Data Persistence**: Wins, Defense, and Stamina stats are saved to MongoDB.
- **Session Management**: JWT-based authentication.

### 2. 🛡 Battle Arena (PvP)
- **Matchmaking**: Fetches real opponents from the database via `/api/users`.
- **Raid Mechanics**: Players "raid" other users. Success depends on Defense stats and Puzzle solving.
- **Stats Tracking**: Winning a raid updates the user's `wins` and `streak` on the backend.

### 3. 🧠 AI-Powered "Breach" Protocol
- **Dynamic Difficulty**: The higher the opponent's Defense, the harder the puzzle.
- **Gemini Integration**: The backend (`/api/puzzle`) asks Google Gemini to generate unique logic/math puzzles in real-time.
- **Anti-Bot**: Players must solve the puzzle to execute the on-chain transaction.

### 4. 💰 Yield Integration (DeFi)
- **Principal vs. Yield**: Users deposit USDC. The Principal is "locked" in the vault (safe), while the **Yield** generated is used as "Energy" or "Ammo" for gameplay.
- **Risk-Free Gaming**: You never lose your initial deposit, only the interest earned.

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Lucide React (Icons) |
| **Backend** | Node.js, Express (via Vercel), Mongoose, Google Generative AI SDK |
| **Database** | MongoDB Atlas |
| **Blockchain** | Stellar Soroban (Rust), Freighter Wallet |
| **Hosting** | Vercel (Frontend + API) |

---

## 📂 Project Structure

```
ProjectMain/
├── api/                    # Serverless Backend
│   ├── auth/               # Login/Register endpoints
│   ├── models/             # Mongoose Schemas (User.js)
│   ├── db.js               # Database Connection
│   ├── puzzle.js           # Gemini AI Integration
│   └── users.js            # User fetching & updates
├── frontend/               # React Client
│   ├── src/
│   │   ├── components/     # UI Components (BattleArena, Dashboard, etc.)
│   │   ├── pages/          # Full Pages (Login, Register)
│   │   ├── services/       # MockContract, WalletService
│   │   └── App.tsx         # Main entry
│   └── vite.config.ts      # Vite Config
├── vercel.json             # Deployment Routing
└── package.json            # Dependencies
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create a new user account. |
| `POST` | `/api/auth/login` | Log in and receive JWT. |
| `GET` | `/api/users` | Get top users for Leaderboard/Arena. |
| `POST` | `/api/users/update` | Update stats (win/loss) after a battle. |
| `POST` | `/api/puzzle` | Generate an AI puzzle based on difficulty. |

---

## 🔮 Future Roadmap

1. **Smart Contract Deployment**: Replace `MockContract` with actual calls to the deployed Soroban contracts.
2. **NFT Equipment**: Mint rare items (Shields, Weapons) as NFTs on Stellar.
3. **Alliance System**: Allow users to pool yield together for "Mega Raids".
4. **Mobile App**: Wrap the React frontend into a Capacitor app for iOS/Android.

---

*Verified & Deployed by Agent Antigravity.*
