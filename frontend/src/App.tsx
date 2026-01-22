import { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { BattleArena } from './components/BattleArena';
import { FitnessTracker } from './components/FitnessTracker';
import { MockContract } from './services/mockContract';
import { Leaderboard } from './components/Leaderboard';
import { WalletService } from './services/walletService';
import { StellarService } from './services/stellarService';
import { Wallet, Bell, LogOut } from 'lucide-react';
import { ToastContainer, type ToastMessage, type ToastType } from './components/ui/Toast';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'login' | 'register' | 'game'>('login');

  const [gameState, setGameState] = useState(MockContract.getState());
  const [isDepositing, setIsDepositing] = useState(false);
  
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [xlmBalance, setXlmBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setView('game');
    }
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setView('login');
      setWalletAddress(null);
  };

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

  const refreshGame = () => {
    setGameState(MockContract.getState());
  };

  // Connect wallet
  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      const address = await WalletService.connect();
      setWalletAddress(address);
      
      // Fetch real balance
      const balance = await StellarService.getBalance(address);
      setXlmBalance(balance);
      
      // Update Game State to reflect Wallet Balance as TVL
      const numericBalance = parseFloat(balance);
      if (!isNaN(numericBalance)) {
          MockContract.setPrincipal(numericBalance);
          setGameState(MockContract.getState());
      }

      addToast('success', `Wallet connected! ${address.slice(0, 4)}...${address.slice(-4)}`);
    } catch (error: any) {
      addToast('error', error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (view !== 'game') return;

    // Initial load
    refreshGame();

    // Poll for yield updates every 5 seconds
    const interval = setInterval(() => {
      const oldYield = gameState.yieldEarned;
      const newState = MockContract.claimYield();
      setGameState(newState);

      // Toast on significant yield
      if (newState.yieldEarned > oldYield + 0.01) {
        addToast('success', `Yield Claimed! +${(newState.yieldEarned - oldYield).toFixed(4)} USDC`);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [view]);

  const handleDeposit = () => {
    setIsDepositing(true);
    setTimeout(() => {
      MockContract.deposit(100);
      refreshGame();
      setIsDepositing(false);
      addToast('success', 'Deposit Successful! + USDC');
    }, 1000);
  };

  if (view === 'login') {
      return <Login onLoginSuccess={(u) => { setUser(u); setView('game'); }} onSwitchToRegister={() => setView('register')} />;
  }
  if (view === 'register') {
      return <Register onRegisterSuccess={(u) => { setUser(u); setView('game'); }} onSwitchToLogin={() => setView('login')} />;
  }

  return (
    <div className="min-h-screen pb-20 relative bg-[#0f172a] text-white">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-white">Y</div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Yield Raiders</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden md:block font-mono">
                {user?.username ? `CMD ${user.username}` : ''}
            </span>
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              {gameState.history.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            <button 
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full transition-all text-sm text-white font-medium disabled:opacity-50"
            >
              <Wallet size={16} />
              {walletAddress 
                ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
                : gameState.principal > 0 
                  ? '0xUser...Wallet' 
                  : 'Connect'
              }
            </button>
            <button onClick={handleLogout} className="p-2 text-red-500/70 hover:text-red-400 transition-colors" title="Logout">
                <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 pt-8 space-y-8">

        {/* Welcome / Deposit Action */}
        {gameState.principal === 0 && (
          <div className="glass-panel p-8 rounded-2xl text-center border border-white/10 bg-white/5 backdrop-blur-md">
            <h2 className="text-3xl font-bold text-white mb-4">Your Fortress Awaits</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              {walletAddress 
                ? `Connected: ${xlmBalance} XLM available. Deposit USDC to start.`
                : 'Connect your Freighter wallet to start playing on Stellar blockchain'
              }
            </p>
            {!walletAddress ? (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect Freighter Wallet'}
              </button>
            ) : (
              <button
                onClick={handleDeposit}
                disabled={isDepositing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isDepositing ? 'Deploying Vault...' : 'Deposit USDC (Demo)'}
              </button>
            )}
          </div>
        )}

        {gameState.principal > 0 && (
          <>
            <div className="bg-slate-800/50 p-4 rounded-lg mb-6 flex justify-between items-center border border-white/5">
               <span className="text-gray-300">Stellar Balance:</span>
               <span className="text-xl font-mono text-yellow-400">{xlmBalance} XLM</span>
            </div>

            <Dashboard
              principal={gameState.principal}
              commandTokens={gameState.commandTokens}
              yieldEarned={gameState.yieldEarned}
              defense={gameState.defense}
              stamina={gameState.stamina}
              streakDays={gameState.streakDays}
            />

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <BattleArena
                    refreshGame={refreshGame}
                    onToast={(type: ToastType, msg: string) => addToast(type, msg)}
                    walletAddress={walletAddress}
                />
              </div>
              <div className="flex-1">
                <FitnessTracker
                    refreshGame={refreshGame}
                    currentSteps={gameState.stepCount}
                    onToast={(type: ToastType, msg: string) => addToast(type, msg)}
                    walletAddress={walletAddress}
                />
              </div>
            </div>

            {/* Activity Feed & Leaderboard */}
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 glass-panel p-6 rounded-2xl h-full border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Activity Log</h3>
                  <span className="text-xs text-gray-500">Real-time updates</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {gameState.history.map((log, i) => (
                    <div key={i} className="text-sm text-gray-400 border-b border-white/5 pb-2 last:border-0 animate-in fade-in slide-in-from-left-2">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                 <Leaderboard />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
