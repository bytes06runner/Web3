import { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { BattleArena } from './components/BattleArena';
import { FitnessTracker } from './components/FitnessTracker';
import { MockContract } from './services/mockContract';
import { Wallet, Bell } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState(MockContract.getState());
  const [isDepositing, setIsDepositing] = useState(false);

  const refreshGame = () => {
    setGameState(MockContract.getState());
  };

  useEffect(() => {
    // Initial load
    refreshGame();

    // Poll for yield updates every 5 seconds
    const interval = setInterval(() => {
      MockContract.claimYield();
      refreshGame();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeposit = () => {
    setIsDepositing(true);
    setTimeout(() => {
      MockContract.deposit(100);
      refreshGame();
      setIsDepositing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-white">Y</div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Yield Raiders</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              {gameState.history.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full transition-all text-sm text-white font-medium">
              <Wallet size={16} />
              {gameState.principal > 0 ? '0xUser...Wallet' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 pt-8 space-y-8">

        {/* Welcome / Deposit Action */}
        {gameState.principal === 0 && (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Your Fortress Awaits</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">Deposit USDC to start generating yield and Command Tokens. Walk to boost your defenses.</p>
            <button
              onClick={handleDeposit}
              disabled={isDepositing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isDepositing ? 'Deploying Vault...' : 'Deposit $100 USDC'}
            </button>
          </div>
        )}

        {gameState.principal > 0 && (
          <>
            <Dashboard
              principal={gameState.principal}
              commandTokens={gameState.commandTokens}
              yieldEarned={gameState.yieldEarned}
              defense={gameState.defense}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <BattleArena refreshGame={refreshGame} />
              <FitnessTracker refreshGame={refreshGame} currentSteps={gameState.stepCount} />
            </div>

            {/* Activity Feed */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">Activity Log</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {gameState.history.map((log, i) => (
                  <div key={i} className="text-sm text-gray-400 border-b border-white/5 pb-2 last:border-0">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
