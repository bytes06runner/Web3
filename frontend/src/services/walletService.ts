import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';

export class WalletService {
  static async connect(): Promise<string> {
    const connected = await isConnected();
    if (!connected) {
      window.open('https://freighter.app/', '_blank');
      throw new Error('Please install Freighter wallet extension');
    }
    
    const publicKey = await getPublicKey();
    return publicKey;
  }

  static async isInstalled(): Promise<boolean> {
    return await isConnected();
  }

  static async signTransaction(xdr: string, networkPassphrase: string): Promise<string> {
    return await signTransaction(xdr, { networkPassphrase });
  }
}
