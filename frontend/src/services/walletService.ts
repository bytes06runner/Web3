import { isConnected, getPublicKey, signTransaction, setAllowed } from '@stellar/freighter-api';

export class WalletService {
  static async connect(): Promise<string> {
    // 1. Check if extension is available
    let connected = await isConnected();
    if (!connected) {
        // Try waiting a moment - sometimes injection is slow
        await new Promise(r => setTimeout(r, 500));
        connected = await isConnected();
        if (!connected) {
           window.open('https://freighter.app/', '_blank');
           throw new Error('Freighter wallet not found. Please install the extension.');
        }
    }

    try {
        // 2. Request access explicitely
        const allowed = await setAllowed();
        if (!allowed) {
            // It might return false if user denied OR if already allowed?
            // Actually in some versions setAllowed() returns the key? No, it returns boolean.
            // If false, it means user denied or closed.
            // But let's check publicKey anyway, just in case.
        }

        // 3. Get Key
        const publicKey = await getPublicKey();
        
        if (!publicKey) {
             throw new Error('User denied wallet connection or closed the popup.');
        }

        return publicKey;
    } catch (e: any) {
        console.error("Wallet connection error:", e);
        if (e.message && e.message.includes("User declined")) {
             throw new Error("Connection request declined by user.");
        }
        throw new Error(e.message || "Failed to connect to Freighter");
    }
  }

  static async isInstalled(): Promise<boolean> {
    return await isConnected();
  }

  static async signTransaction(xdr: string, networkPassphrase: string): Promise<string> {
    return await signTransaction(xdr, { networkPassphrase });
  }
}
