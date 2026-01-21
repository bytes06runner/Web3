# Windows Setup Guide - Stellar Smart Contracts

## Step 1: Install Rust (15 mins)

### Download Rust Installer
1. Go to: https://rustup.rs/
2. Click "Download rustup-init.exe (64-bit)"
3. Run the downloaded file
4. When prompted, press Enter to proceed with default installation
5. Wait for installation to complete

### Verify Installation
Open a **NEW** Command Prompt or PowerShell and run:
```cmd
cargo --version
rustc --version
```

You should see version numbers like:
```
cargo 1.75.0
rustc 1.75.0
```

---

## Step 2: Add WASM Target (2 mins)

```cmd
rustup target add wasm32-unknown-unknown
```

---

## Step 3: Install Stellar CLI (10 mins)

```cmd
cargo install --locked stellar-cli --features opt
```

This will take 5-10 minutes. You'll see lots of "Compiling..." messages - that's normal!

### Verify Stellar CLI
```cmd
stellar --version
```

Should show: `stellar-cli 21.x.x`

---

## Step 4: Build Your Contract (2 mins)

```cmd
cd Web3\contracts
stellar contract build
```

Success looks like:
```
✅ Compiled successfully
   Output: target\wasm32-unknown-unknown\release\yield_raiders_contracts.wasm
```

---

## Step 5: Deploy to Testnet (5 mins)

### Setup Testnet
```cmd
stellar network add testnet --rpc-url https://soroban-testnet.stellar.org:443 --network-passphrase "Test SDF Network ; September 2015"

stellar keys generate mykey --network testnet

stellar keys fund mykey --network testnet
```

### Deploy Contract
```cmd
stellar contract deploy --wasm target\wasm32-unknown-unknown\release\yield_raiders_contracts.wasm --source mykey --network testnet
```

**SAVE THE CONTRACT ID!** It looks like: `CCXYZ123ABC...DEF789`

---

## Step 6: Update Frontend (2 mins)

Open `Web3\frontend\src\services\stellarContractService.ts`

Replace this line:
```typescript
const CONTRACT_ID = 'YOUR_CONTRACT_ID_HERE';
```

With your actual contract ID:
```typescript
const CONTRACT_ID = 'CCXYZ123ABC...DEF789'; // Your actual ID
```

---

## Step 7: Install Frontend Dependencies (5 mins)

```cmd
cd Web3\frontend
npm install
```

---

## Step 8: Install Freighter Wallet (5 mins)

1. Go to: https://freighter.app/
2. Install Chrome/Edge extension
3. Create new wallet (save your seed phrase!)
4. Click settings icon → Switch to **Testnet**
5. Get free testnet XLM: https://laboratory.stellar.org/#account-creator

---

## Step 9: Test Your App (10 mins)

```cmd
npm run dev
```

Open: http://localhost:5173

1. Click "Connect Freighter"
2. Approve connection
3. Click "Deposit $100 USDC"
4. Sign transaction in Freighter popup
5. Wait for confirmation
6. See your vault data appear!

---

## Troubleshooting

### "cargo: command not found"
**Fix:** Close and reopen your terminal after installing Rust

### "error: linker 'link.exe' not found"
**Fix:** Install Visual Studio Build Tools:
https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

Download "Build Tools for Visual Studio 2022" and install "Desktop development with C++"

### "stellar: command not found"
**Fix:** Add to PATH manually:
```cmd
set PATH=%USERPROFILE%\.cargo\bin;%PATH%
```

Or restart your terminal.

### "Transaction failed"
**Fix:** Make sure you're on Testnet in Freighter and have testnet XLM

---

## Total Time: ~1 hour

After this, you'll have:
✅ Rust installed
✅ Contract compiled to WASM
✅ Contract deployed to Stellar testnet
✅ Frontend connected to real blockchain
✅ Freighter wallet integrated

**You're ready to demo! 🚀**
