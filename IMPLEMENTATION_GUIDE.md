# Yield Raiders - Implementation Guide

## Phase 1: Contract Deployment (Week 1)

### Prerequisites
```bash
# Install Stellar CLI
cargo install --locked stellar-cli --features opt

# Verify installation
stellar --version
```

### Step 1: Build Your Contract
```bash
cd Web3/contracts
stellar contract build
```

This creates: `target/wasm32-unknown-unknown/release/yield_raiders_contracts.wasm`

### Step 2: Deploy to Testnet
```bash
# Configure testnet
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Generate test identity
stellar keys generate alice --network testnet

# Fund account (get testnet XLM)
stellar keys fund alice --network testnet

# Deploy contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/yield_raiders_contracts.wasm \
  --source alice \
  --network testnet

# Save the CONTRACT_ID output!
```

### Step 3: Test Contract Functions
```bash
# Example: Call deposit function
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- \
  deposit \
  --user <ALICE_PUBLIC_KEY> \
  --amount 100
```

---

## Phase 2: Wallet Integration (Week 2)

### Install Dependencies
```bash
cd Web3/frontend
npm install @stellar/freighter-api @stellar/stellar-sdk
```

### Create Wallet Service

**File: `src/services/walletService.ts`**
```typescript
import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';

export class WalletService {
  static async connect(): Promise<string> {
    const connected = await isConnected();
    if (!connected) {
      throw new Error('Freighter wallet not installed');
    }
    
    const publicKey = await getPublicKey();
    return publicKey;
  }

  static async disconnect(): Promise<void> {
    // Freighter doesn't have explicit disconnect
    // Just clear local state
  }

  static async isInstalled(): Promise<boolean> {
    return await isConnected();
  }
}
```

### Create Contract Service

**File: `src/services/contractService.ts`**
```typescript
import * as StellarSdk from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

const CONTRACT_ID = 'YOUR_DEPLOYED_CONTRACT_ID';
const RPC_URL = 'https://soroban-testnet.stellar.org:443';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

export class ContractService {
  private server: StellarSdk.SorobanRpc.Server;

  constructor() {
    this.server = new StellarSdk.SorobanRpc.Server(RPC_URL);
  }

  async deposit(userPublicKey: string, amount: number) {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    
    // Build transaction
    const account = await this.server.getAccount(userPublicKey);
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'deposit',
          StellarSdk.Address.fromString(userPublicKey).toScVal(),
          StellarSdk.nativeToScVal(amount, { type: 'i128' })
        )
      )
      .setTimeout(30)
      .build();

    // Simulate first
    const simulated = await this.server.simulateTransaction(transaction);
    const prepared = StellarSdk.SorobanRpc.assembleTransaction(
      transaction,
      simulated
    ).build();

    // Sign with Freighter
    const signedXDR = await signTransaction(prepared.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    const signedTx = StellarSdk.TransactionBuilder.fromXDR(
      signedXDR,
      NETWORK_PASSPHRASE
    );

    // Submit
    const result = await this.server.sendTransaction(signedTx);
    return result;
  }

  async getVault(userPublicKey: string) {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    
    const account = await this.server.getAccount(userPublicKey);
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'get_vault',
          StellarSdk.Address.fromString(userPublicKey).toScVal()
        )
      )
      .setTimeout(30)
      .build();

    const simulated = await this.server.simulateTransaction(transaction);
    
    // Parse result
    if (simulated.result) {
      return this.parseVaultData(simulated.result.retval);
    }
    return null;
  }

  private parseVaultData(scVal: any) {
    // Parse Soroban ScVal to JavaScript object
    // This depends on your contract's return structure
    return {
      principal: 0, // Parse from scVal
      commandTokens: 0,
      defense: 0,
      // ... etc
    };
  }
}
```

---

## Phase 3: Update Frontend (Week 3)

### Replace Mock Contract

**Update `App.tsx`:**
```typescript
import { useState, useEffect } from 'react';
import { WalletService } from './services/walletService';
import { ContractService } from './services/contractService';

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [contractService] = useState(new ContractService());

  const handleConnectWallet = async () => {
    try {
      const address = await WalletService.connect();
      setWalletAddress(address);
      
      // Load user's vault data
      const vault = await contractService.getVault(address);
      // Update state...
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const handleDeposit = async () => {
    if (!walletAddress) return;
    
    try {
      await contractService.deposit(walletAddress, 100);
      // Refresh vault data
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  // ... rest of component
}
```

---

## Phase 4: Testing Checklist

- [ ] Contract builds without errors
- [ ] Contract deploys to testnet
- [ ] Can invoke contract functions via CLI
- [ ] Freighter wallet connects
- [ ] Can sign transactions
- [ ] Deposit function works end-to-end
- [ ] Vault data loads correctly
- [ ] All game mechanics work on-chain

---

## Common Issues & Solutions

### Issue: "Contract not found"
**Solution:** Make sure you're using the correct CONTRACT_ID from deployment

### Issue: "Transaction failed"
**Solution:** Check account has enough XLM for fees (fund via friendbot)

### Issue: "Freighter not detected"
**Solution:** Install Freighter extension: https://freighter.app/

### Issue: "Simulation failed"
**Solution:** Check contract function parameters match expected types

---

## Resources

- **Soroban Docs:** https://soroban.stellar.org/docs
- **Freighter Wallet:** https://freighter.app/
- **Stellar SDK:** https://stellar.github.io/js-stellar-sdk/
- **Testnet Friendbot:** https://laboratory.stellar.org/#account-creator
- **Soroban Examples:** https://github.com/stellar/soroban-examples

---

## Next Steps After Basic Integration

1. Add error handling & loading states
2. Implement all contract functions (raid, claim_yield, etc.)
3. Add transaction history tracking
4. Implement fitness oracle integration
5. Deploy to mainnet
6. Add analytics & monitoring
