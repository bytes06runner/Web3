# Quick Start - Your First 15 Minutes

## Step 1: Install Stellar CLI (5 mins)

```bash
cargo install --locked stellar-cli --features opt
```

Wait for it to install, then verify:
```bash
stellar --version
```

You should see something like: `stellar-cli 21.x.x`

---

## Step 2: Build Your Contract (2 mins)

```bash
cd Web3/contracts
stellar contract build
```

If successful, you'll see:
```
✅ Compiled successfully
   Output: target/wasm32-unknown-unknown/release/yield_raiders_contracts.wasm
```

---

## Step 3: Setup Testnet (3 mins)

```bash
# Add testnet network
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Create your identity
stellar keys generate mykey --network testnet

# Get free testnet XLM (takes ~10 seconds)
stellar keys fund mykey --network testnet
```

---

## Step 4: Deploy Your Contract (5 mins)

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/yield_raiders_contracts.wasm \
  --source mykey \
  --network testnet
```

**SAVE THE OUTPUT!** You'll get something like:
```
CCXYZ123ABC...DEF789
```

This is your **CONTRACT_ID** - you need it for everything!

---

## Step 5: Test It Works

```bash
# Replace <CONTRACT_ID> with your actual ID
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source mykey \
  --network testnet \
  -- \
  get_vault \
  --user $(stellar keys address mykey)
```

If you see `None` or an error about vault not found - **that's good!** It means the contract is working, you just haven't deposited yet.

---

## What You Just Did:

✅ Installed Stellar CLI  
✅ Built your Rust contract to WASM  
test the contract
✅ Created a testnet account  
✅ Deployed your contract to Stellar testnet  
✅ Called a contract function  

**You now have a live smart contract on the blockchain!**

---

## Next Steps:

1. **Try calling deposit:**
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source mykey \
  --network testnet \
  -- \
  deposit \
  --user $(stellar keys address mykey) \
  --amount 100
```

2. **Check your vault again:**
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source mykey \
  --network testnet \
  -- \
  get_vault \
  --user $(stellar keys address mykey)
```

You should see your vault data!

---

## Common Errors:

### "stellar: command not found"
**Fix:** Restart your terminal or add cargo bin to PATH:
```bash
export PATH="$HOME/.cargo/bin:$PATH"
```

### "error: target not found"
**Fix:** Add wasm target:
```bash
rustup target add wasm32-unknown-unknown
```

### "insufficient balance"
**Fix:** Fund your account again:
```bash
stellar keys fund mykey --network testnet
```

---

## Resources:

- **Stellar CLI Docs:** https://developers.stellar.org/docs/tools/developer-tools/cli
- **Soroban Docs:** https://soroban.stellar.org/docs
- **Your Implementation Guide:** See `IMPLEMENTATION_GUIDE.md`

---

## After This:

Once you've deployed and tested via CLI, move to:
1. Install Freighter wallet (browser extension)
2. Learn to call your contract from JavaScript
3. Replace `mockContract.ts` with real contract calls

**You're on your way! 🚀**
