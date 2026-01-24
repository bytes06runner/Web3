import { Horizon, Keypair, TransactionBuilder, Networks, Asset, Operation } from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

const STELLAR_HORIZON_URL = 'https://horizon-testnet.stellar.org';
const server = new Horizon.Server(STELLAR_HORIZON_URL);

// GAME BANK WALLET (Testnet Receiver)
const GAME_BANK_PUBLIC_KEY = 'GDCPQHJJUY7TFYKIVRL3LQ32R5W5IGFFUE3MQTXCGCA7MZLWTTRVFQDA';

export class StellarService {
  
  static async getBalance(publicKey: string): Promise<string> {
    try {
      const account = await server.loadAccount(publicKey);
      const xlmBalance = account.balances.find((balance) => balance.asset_type === 'native');
      return xlmBalance ? xlmBalance.balance : '0';
    } catch (error: any) {
      console.error('Error fetching Stellar balance:', error);
      return '0';
    }
  }

  // DEPOSIT / STAKE LOGIC (Uses Freighter)
  static async deposit(userPublicKey: string, amountXLM: string): Promise<string> {
      try {
          // 1. Load User Account (for sequence number)
          const account = await server.loadAccount(userPublicKey);
          const fee = await server.fetchBaseFee();

          // 2. Build Transaction: Payment to Game Bank
          const transaction = new TransactionBuilder(account, { 
              fee: fee.toString(), 
              networkPassphrase: Networks.TESTNET 
          })
          .addOperation(Operation.payment({
              destination: GAME_BANK_PUBLIC_KEY,
              asset: Asset.native(),
              amount: amountXLM
          }))
          .setTimeout(30)
          .build();

          // 3. Sign with Freighter (Triggers Extension Popup)
          const signedXDR = await signTransaction(transaction.toXDR(), 'TESTNET');
          
          if (!signedXDR) {
              throw new Error("User cancelled signature or Freighter not found.");
          }
          
          // 4. Submit to Network
          const tx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
          const result = await server.submitTransaction(tx);
          
          console.log("Transaction Success:", result.hash);
          return result.hash;

      } catch(error) {
          console.error("Payment Failed:", error);
          throw error;
      }
  }

  // Alias for readability in Game Logic
  static async stakeRaid(userPublicKey: string): Promise<string> {
      return this.deposit(userPublicKey, "100");
  }

  static async upgradeDefense(userPublicKey: string, cost: string): Promise<string> {
      return this.deposit(userPublicKey, cost);
  }
}
