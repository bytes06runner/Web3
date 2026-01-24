import { Horizon, Keypair, TransactionBuilder, Networks, Asset, Operation } from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

const STELLAR_HORIZON_URL = 'https://horizon-testnet.stellar.org';
const server = new Horizon.Server(STELLAR_HORIZON_URL);

// GAME BANK KEYS (Testnet Only)
// Public: GDCPQHJJUY7TFYKIVRL3LQ32R5W5IGFFUE3MQTXCGCA7MZLWTTRVFQDA
const GAME_BANK_SECRET = 'SC5ARIKNBFWASHXN2SJY2PZGXVPHEXTC6RYTHO63IB736DI4AM4TWFSA';
const bankKeypair = Keypair.fromSecret(GAME_BANK_SECRET);

export class StellarService {
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

          const signedXDR = await signTransaction(transaction.toXDR(), 'TESTNET');
          if (!signedXDR) throw new Error("User cancelled signature");
          
          const tx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
          const result = await server.submitTransaction(tx);
          return result;
      } catch(error) {
          console.error("Payment to Bank Failed:", error);
          throw error;
      }
  }

  static async payoutToUser(userPublicKey: string, amountXLM: string): Promise<any> {
      try {
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
          return await server.submitTransaction(transaction);
      } catch(error) {
          console.error("Payout to User Failed:", error);
          throw error;
      }
  }

  // V3 Methods
  static async deposit(userPublicKey: string, amountXLM: string): Promise<string> {
      const res = await this.createPaymentToBank(userPublicKey, amountXLM);
      return res.hash;
  }

  static async stakeRaid(userPublicKey: string): Promise<string> {
      return this.deposit(userPublicKey, "100");
  }

  static async upgradeDefense(userPublicKey: string, cost: string): Promise<string> {
      return this.deposit(userPublicKey, cost);
  }
}
