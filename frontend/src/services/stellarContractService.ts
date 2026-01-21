// @ts-nocheck
import { Server, Contract, TransactionBuilder, BASE_FEE, Networks, Address, nativeToScVal, xdr } from '@stellar/stellar-sdk';
import { WalletService } from './walletService';

// REPLACE WITH YOUR DEPLOYED CONTRACT ID
const CONTRACT_ID = 'CA3KFZOFBWA4XACE23NQVILP5VB4IZRMKGO7KJ4F3KKI4PFX3LEHQQ6T';
const RPC_URL = 'https://soroban-testnet.stellar.org:443';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

export class StellarContractService {
  private server: Server;

  constructor() {
    this.server = new Server(RPC_URL);
  }

  /**
   * Deposit USDC to vault
   */
  async deposit(userPublicKey: string, amount: number) {
    try {
      const contract = new Contract(CONTRACT_ID);
      const account = await this.server.getAccount(userPublicKey);

      // Build transaction
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            'deposit',
            Address.fromString(userPublicKey).toScVal(),
            nativeToScVal(amount, { type: 'i128' })
          )
        )
        .setTimeout(30)
        .build();

      // Simulate
      const simulated = await this.server.simulateTransaction(transaction);
      if ((simulated as any).error) {
        throw new Error(`Simulation failed: ${(simulated as any).error}`);
      }

      // Prepare transaction
      const prepared = (this.server as any).prepareTransaction?.(transaction, simulated) || transaction;

      // Sign with Freighter
      const signedXDR = await WalletService.signTransaction(
        prepared.toXDR(),
        NETWORK_PASSPHRASE
      );

      const signedTx = TransactionBuilder.fromXDR(
        signedXDR,
        NETWORK_PASSPHRASE
      );

      // Submit
      const result = await this.server.sendTransaction(signedTx as any);
      
      return result;
    } catch (error) {
      console.error('Deposit failed:', error);
      throw error;
    }
  }

  /**
   * Get user's vault data
   */
  async getVault(userPublicKey: string) {
    try {
      const contract = new Contract(CONTRACT_ID);
      const account = await this.server.getAccount(userPublicKey);

      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            'get_vault',
            Address.fromString(userPublicKey).toScVal()
          )
        )
        .setTimeout(30)
        .build();

      const simulated = await this.server.simulateTransaction(transaction);
      
      if ((simulated as any).error) {
        return null; // Vault doesn't exist yet
      }

      if ((simulated as any).result) {
        return this.parseVaultData((simulated as any).result.retval);
      }
      
      return null;
    } catch (error) {
      console.error('Get vault failed:', error);
      return null;
    }
  }

  /**
   * Claim yield
   */
  async claimYield(userPublicKey: string) {
    try {
      const contract = new Contract(CONTRACT_ID);
      const account = await this.server.getAccount(userPublicKey);

      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            'claim_yield',
            Address.fromString(userPublicKey).toScVal()
          )
        )
        .setTimeout(30)
        .build();

      const simulated = await this.server.simulateTransaction(transaction);
      if ((simulated as any).error) {
        throw new Error(`Simulation failed: ${(simulated as any).error}`);
      }

      const prepared = (this.server as any).prepareTransaction?.(transaction, simulated) || transaction;

      const signedXDR = await WalletService.signTransaction(
        prepared.toXDR(),
        NETWORK_PASSPHRASE
      );

      const signedTx = TransactionBuilder.fromXDR(
        signedXDR,
        NETWORK_PASSPHRASE
      );

      const result = await this.server.sendTransaction(signedTx as any);
      
      return result;
    } catch (error) {
      console.error('Claim yield failed:', error);
      throw error;
    }
  }

  /**
   * Record fitness steps
   */
  async recordSteps(userPublicKey: string, steps: number) {
    try {
      const contract = new Contract(CONTRACT_ID);
      const account = await this.server.getAccount(userPublicKey);

      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            'record_steps',
            Address.fromString(userPublicKey).toScVal(),
            nativeToScVal(steps, { type: 'u32' })
          )
        )
        .setTimeout(30)
        .build();

      const simulated = await this.server.simulateTransaction(transaction);
      if ((simulated as any).error) {
        throw new Error(`Simulation failed: ${(simulated as any).error}`);
      }

      const prepared = (this.server as any).prepareTransaction?.(transaction, simulated) || transaction;

      const signedXDR = await WalletService.signTransaction(
        prepared.toXDR(),
        NETWORK_PASSPHRASE
      );

      const signedTx = TransactionBuilder.fromXDR(
        signedXDR,
        NETWORK_PASSPHRASE
      );

      const result = await this.server.sendTransaction(signedTx as any);
      
      return result;
    } catch (error) {
      console.error('Record steps failed:', error);
      throw error;
    }
  }

  /**
   * Raid another player
   */
  async raid(attackerPublicKey: string, defenderPublicKey: string) {
    try {
      const contract = new Contract(CONTRACT_ID);
      const account = await this.server.getAccount(attackerPublicKey);

      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            'raid',
            Address.fromString(attackerPublicKey).toScVal(),
            Address.fromString(defenderPublicKey).toScVal()
          )
        )
        .setTimeout(30)
        .build();

      const simulated = await this.server.simulateTransaction(transaction);
      if ((simulated as any).error) {
        throw new Error(`Simulation failed: ${(simulated as any).error}`);
      }

      const prepared = (this.server as any).prepareTransaction?.(transaction, simulated) || transaction;

      const signedXDR = await WalletService.signTransaction(
        prepared.toXDR(),
        NETWORK_PASSPHRASE
      );

      const signedTx = TransactionBuilder.fromXDR(
        signedXDR,
        NETWORK_PASSPHRASE
      );

      const result = await this.server.sendTransaction(signedTx as any);
      
      return result;
    } catch (error) {
      console.error('Raid failed:', error);
      throw error;
    }
  }

  /**
   * Parse vault data from ScVal
   */
  private parseVaultData(scVal: any): any {
    // Simplified parsing - return mock structure for now
    return {
      principal: 0,
      commandTokens: 0,
      defense: 100,
      stamina: 100,
      totalSteps: 0,
    };
  }
}
