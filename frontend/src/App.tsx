// @ts-nocheck
import { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { BattleArena } from './components/BattleArena';
import { Barracks } from './components/Barracks';
import { UpgradeShieldButton } from './components/UpgradeShieldButton'; // NEW COMPONENT
import { MockContract } from './services/mockContract';
import { Leaderboard } from './components/Leaderboard';
import { ActivityLog } from './components/ActivityLog';
import { WalletService } from './services/walletService';
import { StellarService } from './services/stellarService';
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
      if (newToasts.length > 3) return newToasts.slice(newToasts.length - 3);
      return newToasts;
    });
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));
  const refreshGame = () => { setGameState(MockContract.getState()); fetchUserData(); };

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      const address = await WalletService.connect();
      setWalletAddress(address);
      const balance = await StellarService.getBalance(address);
      setXlmBalance(balance);
      const numericBalance = parseFloat(balance);
      if (!isNaN(numericBalance)) {
          MockContract.setPrincipal(numericBalance);
          if (user?.capacity) MockContract.setCapacity(user.capacity);
          setGameState(MockContract.getState());
      }
      addToast('success', `Wallet connected!`);
    } catch (error: any) {
      addToast('error', error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchUserData = useCallback(async () => {
      if (!user?.walletAddress) return;
      try {
          const res = await fetch(`/api/users?walletAddress=${user.walletAddress}`);
          if (res.ok) {
              const updatedUser = await res.json();
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser)); 
          }
      } catch (err) { console.error("Failed to refresh user data", err); }
  }, [user?.walletAddress]);

  useEffect(() => {
    if (view !== 'game') return;
    refreshGame();
    const interval = setInterval(() => {
      const newState = MockContract.claimYield();
      setGameState(newState);
      fetchUserData();
    }, 5000);
    return () => clearInterval(interval);
  }, [view, fetchUserData]);

  const capacityUsed = ((gameState.troops?.archers||0)*5) + ((gameState.troops?.infantry||0)*10) + ((gameState.troops?.giants||0)*20);
  const availableCapacity = 100 - capacityUsed;

  const handleDeposit = async () => {}; 

  if (view === 'login') return <Login onLoginSuccess={(u) => { setUser(u); setView('game'); }} onSwitchToRegister={() => setView('register')} />;
  if (view === 'register') return <Register onRegisterSuccess={(u) => { setUser(u); setView('game'); }} onSwitchToLogin={() => setView('login')} />;

  return (
    <div className="min-h-screen pb-20 relative text-white font-sans selection:bg-red-500/30">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* 1. Header */}
      <Header 
         balance={xlmBalance} 
         apy="+5% APY"
         username={user?.username || 'Guest'}
         onLogout={handleLogout}
         walletAddress={walletAddress}
         onConnect={handleConnectWallet}
      />

      <main className="max-w-6xl mx-auto px-4 space-y-12 relative z-10">
        
        {/* 2. Mid Bar (Status Indicators) */}
        <Dashboard 
            capacity={availableCapacity}
            defense={user?.stats?.defense || gameState.defense}
            streakDays={gameState.streakDays}
            className="max-w-4xl mx-auto"
        />

        {/* 3. The Barracks (3-Column Dungeon) */}
        <div className="w-full animate-in fade-in zoom-in duration-500">
            <Barracks
                troops={gameState.troops}
                commandTokens={gameState.commandTokens}
                stamina={gameState.stamina}
                walletAddress={walletAddress}
                onTrain={refreshGame}
                onToast={(type: ToastType, msg: string) => addToast(type, msg)}
            />
        </div>

        {/* 4. Upgrade Shield Button (New Section) */}
        <div className="w-full">
            <UpgradeShieldButton 
                walletAddress={walletAddress}
                onUpgrade={refreshGame}
                onToast={(type: ToastType, msg: string) => addToast(type, msg)}
            />
        </div>

        {/* 5. The Lower Deck (Arena, Leaderboard, Log) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pb-12">
            {/* Left: Battle Arena */}
            <div className="md:mt-4">
                <BattleArena
                    refreshGame={refreshGame}
                    onToast={(type: ToastType, msg: string) => addToast(type, msg)}
                    walletAddress={walletAddress}
                    user={user}
                    xlmBalance={xlmBalance}
                    troops={gameState.troops}
                />
            </div>
            
            {/* Center: Leaderboard */}
            <div className="relative z-20 md:-mt-8 scale-105">
                <Leaderboard />
            </div>

            {/* Right: Activity Log */}
            <div className="md:mt-4">
                <ActivityLog history={gameState.history} />
            </div>
        </div>

      </main>

      {/* Background Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/20 to-black/40 z-0"></div>
    </div>
  );
}

export default App;
