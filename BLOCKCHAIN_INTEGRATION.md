# Blockchain Integration - Step by Step

## Total Time: 8-10 hours

---

## Phase 1: Deploy Contract (1 hour)

### Step 1: Install Stellar CLI
```bash
cargo install --locked stellar-cli --features opt
```

### Step 2: Build Contract
```bash
cd Web3/contracts
stellar contract build
```

### Step 3: Setup Testnet
```bash
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

stellar keys generate mykey --network testnet
stellar keys fund mykey --network testnet
```

### Step 4: Deploy
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/yield_raiders_contracts.wasm \
  --source mykey \
  --network testnet
```

**SAVE THE CONTRACT_ID!** You'll need it in Step 5.

### Step 5: Update Contract ID
Open `Web3/frontend/src/services/stellarContractService.ts` and replace:
```typescript
const CONTRACT_ID = 'YOUR_CONTRACT_ID_HERE';
```
with your actual contract ID.

---

## Phase 2: Install Dependencies (15 mins)

```bash
cd Web3/frontend
npm install
```

This installs:
- `@stellar/freighter-api` - Wallet connection
- `@stellar/stellar-sdk` - Blockchain interactions

---

## Phase 3: Install Freighter Wallet (5 mins)

1. Go to https://freighter.app/
2. Install browser extension
3. Create new wallet
4. Switch to **Testnet** in settings
5. Get free testnet XLM from friendbot: https://laboratory.stellar.org/#account-creator

---

## Phase 4: Update App.tsx (2 hours)

Replace your current `App.tsx` with blockchain integration:

```typescript
import { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { BattleArena } from './components/BattleArena';
import { FitnessTracker } from './components/FitnessTracker';
import { Leaderboard } from './components/Leaderboard';
import { WalletService } from './services/walletService';
import { StellarContractService } from './services/stellarContractService';
import { Wallet, Bell } from 'lucide-react';
import { ToastContainer, type ToastMessage, type ToastType } from './components/ui/Toast';

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [vaultData, setVaultData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contractService] = useState(new StellarContractService());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => {
      const newToasts = [...prev, { id, type, message }];
      if (newToasts.length > 3) {
        return newToasts.slice(newToasts.length - 3);
      }
      return newToasts;
    });
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Connect wallet
  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      const address = await WalletService.connect();
      setWalletAddress(address);
      addToast('success', 'Wallet connected!');
      
      // Load vault data
      await loadVaultData(address);
    } catch (error: any) {
      addToast('error', error.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Load vault data from blockchain
  const loadVaultData = async (address: string) => {
    try {
      const vault = await contractService.getVault(address);
      setVaultData(vault);
    } catch (error) {
      console.error('Failed to load vault:', error);
    }
  };

  // Deposit USDC
  const handleDeposit = async () => {
    if (!walletAddress) return;
    
    try {
      setIsLoading(true);
      addToast('info', 'Submitting transaction...');
      
      await contractService.deposit(walletAddress, 100);
      
      addToast('success', 'Deposit successful! +$100 USDC');
      await loadVaultData(walletAddress);
    } catch (error: any) {
      addToast('error', error.message || 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Claim yield
  const handleClaimYield = async () => {
    if (!walletAddress) return;
    
    try {
      setIsLoading(true);
      addToast('info', 'Claiming yield...');
      
      await contractService.claimYield(walletAddress);
      
      addToast('success', 'Yield claimed!');
      await loadVaultData(walletAddress);
    } catch (error: any) {
      addToast('error', error.message || 'Claim failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Record steps
  const handleRecordSteps = async (steps: number) => {
    if (!walletAddress) return;
    
    try {
      setIsLoading(true);
      addToast('info', 'Recording steps...');
      
      await contractService.recordSteps(walletAddress, steps);
      
      addToast('success', `Recorded ${steps} steps!`);
      await loadVaultData(walletAddress);
    } catch (error: any) {
      addToast('error', error.message || 'Failed to record steps');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 relative">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-white">Y</div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Yield Raiders</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell size={20} />
            </button>
            <button 
              onClick={handleConnectWallet}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full transition-all text-sm text-white font-medium disabled:opacity-50"
            >
              <Wallet size={16} />
              {walletAddress 
                ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
                : 'Connect Freighter'
              }
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
        {/* Welcome / Deposit Action */}
        {!walletAddress && (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Connect Freighter wallet to start playing Yield Raiders on Stellar blockchain
            </p>
            <button
              onClick={handleConnectWallet}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect Freighter Wallet'}
            </button>
          </div>
        )}

        {walletAddress && !vaultData && (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Your Fortress Awaits</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Deposit USDC to start generating yield and Command Tokens
            </p>
            <button
              onClick={handleDeposit}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Deploying Vault...' : 'Deposit $100 USDC'}
            </button>
          </div>
        )}

        {walletAddress && vaultData && (
          <>
            <Dashboard
              principal={vaultData.principal || 0}
              commandTokens={vaultData.commandTokens || 0}
              yieldEarned={0}
              defense={vaultData.defense || 100}
              stamina={vaultData.stamina || 100}
              streakDays={0}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <BattleArena
                refreshGame={() => loadVaultData(walletAddress)}
                onToast={addToast}
              />
              <FitnessTracker
                refreshGame={() => loadVaultData(walletAddress)}
                currentSteps={vaultData.totalSteps || 0}
                onToast={addToast}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel p-6 rounded-2xl h-full">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleClaimYield}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    Claim Yield
                  </button>
                  <button
                    onClick={() => handleRecordSteps(5000)}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    Record 5000 Steps
                  </button>
                </div>
              </div>

              <Leaderboard />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
```

---

## Phase 5: Test Everything (2 hours)

### Test Checklist:

1. **Start dev server:**
```bash
cd Web3/frontend
npm run dev
```

2. **Open browser:** http://localhost:5173

3. **Test wallet connection:**
   - Click "Connect Freighter"
   - Approve in Freighter popup
   - Should see your address in header

4. **Test deposit:**
   - Click "Deposit $100 USDC"
   - Sign transaction in Freighter
   - Wait for confirmation
   - Should see vault data appear

5. **Test other functions:**
   - Claim yield
   - Record steps
   - Each should trigger Freighter signature

---

## Troubleshooting

### "Freighter not detected"
**Fix:** Install Freighter extension and refresh page

### "Insufficient balance"
**Fix:** Get testnet XLM from friendbot:
```bash
stellar keys fund mykey --network testnet
```

### "Transaction failed"
**Fix:** Check contract is deployed:
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source mykey \
  --network testnet \
  -- get_vault --user $(stellar keys address mykey)
```

### "Simulation failed"
**Fix:** Your contract might have a bug. Check contract logs or redeploy.

---

## What You Learned:

✅ Stellar CLI (deploy contracts)
✅ Freighter API (wallet connection)
✅ Stellar SDK (build transactions)
✅ Contract invocation (call functions)
✅ Transaction signing (Freighter)

---

## For Demo:

1. Show wallet connection
2. Show deposit transaction (Freighter popup)
3. Show transaction on Stellar Expert: https://stellar.expert/explorer/testnet
4. Show vault data loading from blockchain
5. Show other functions working

**This proves your app works on real blockchain!**
