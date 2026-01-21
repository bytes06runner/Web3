// @ts-nocheck
import { Horizon, Keypair, TransactionBuilder, Networks, Asset, Operation } from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

const STELLAR_HORIZON_URL = 'https://horizon-testnet.stellar.org';
const server = new Horizon.Server(STELLAR_HORIZON_URL);

// GAME BANK KEYS (Testnet Only)
// Public: GDCPQHJJUY7TFYKIVRL3LQ32R5W5IGFFUE3MQTXCGCA7MZLWTTRVFQDA
const GAME_BANK_SECRET = 'SC5ARIKNBFWASHXN2SJY2PZGXVPHEXTC6RYTHO63IB736DI4AM4TWFSA';
const bankKeypair = Keypair.fromSecret(GAME_BANK_SECRET);

export class StellarService {
  /**
   * Fetches the XLM balance for a given public key.
   */
  static async getBalance(publicKey: string): Promise<string> {
    try {
      const account = await server.loadAccount(publicKey);
      const xlmBalance = account.balances.find(
        (balance) => balance.asset_type === 'native'
      );
      return xlmBalance ? xlmBalance.balance : '0';
    } catch (error: any) {
      console.error('Error fetching Stellar balance:', error);
      return '0';
    }
  }

  /**
   * Creates a transaction for the USER to sign, paying the Bank.
   * Used for Penalties (Raid loss) or Entry Fees (Drills).
   */
  static async createPaymentToBank(userPublicKey: string, amountXLM: string): Promise<any> {
      try {
          const account = await server.loadAccount(userPublicKey);
          const fee = await server.fetchBaseFee();

          const transaction = new TransactionBuilder(account, { fee: fee.toString(), networkPassphrase: Networks.TESTNET })
              .addOperation(Operation.payment({
                  destination: bankKeypair.publicKey(),
                  asset: Asset.native(),
                  amount: amountXLM
              }))
              .setTimeout(30)
              .build();

          // Sign with Freighter
          const signedXDR = await signTransaction(transaction.toXDR(), 'TESTNET');
          
          // Submit
          const tx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
          const result = await server.submitTransaction(tx);
          return result;
      } catch(error) {
          console.error("Payment to Bank Failed:", error);
          throw error;
      }
  }

  /**
   * Bank pays the winner (User).
   * Used for Raid Wins or Drill Rewards.
   * This is signed automatically by the backend (Bank Secret).
   */
  static async payoutToUser(userPublicKey: string, amountXLM: string): Promise<any> {
      try {
          // Verify bank has funds
          const bankAccount = await server.loadAccount(bankKeypair.publicKey());
          const fee = await server.fetchBaseFee();

          const transaction = new TransactionBuilder(bankAccount, { fee: fee.toString(), networkPassphrase: Networks.TESTNET })
              .addOperation(Operation.payment({
                  destination: userPublicKey,
                  asset: Asset.native(),
                  amount: amountXLM
              }))
              .setTimeout(30)
              .build();

          transaction.sign(bankKeypair);
          
          const result = await server.submitTransaction(transaction);
          return result;
      } catch(error) {
          console.error("Payout to User Failed:", error);
          throw error;
      }
  }
}
