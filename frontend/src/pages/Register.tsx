import React, { useState } from 'react';
import { User, Lock, Wallet, ArrowRight } from 'lucide-react';
import { WalletService } from '../services/walletService';

interface RegisterProps {
  onRegisterSuccess: (user: any, token: string) => void;
  onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWallet = async () => {
    try {
        const address = await WalletService.connect();
        setWalletAddress(address);
    } catch(e: any) {
        setError("Could not connect Freighter: " + e.message);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, walletAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onRegisterSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-[url('https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
       <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-black/40 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Join the Ranks
          </h1>
          <p className="text-gray-400">Create your Commander Profile</p>
        </div>

        {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="Choose a callsign"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="Create a password"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Wallet Address</label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-xs"
                    placeholder="G..."
                    required
                />
                </div>
                <button type="button" onClick={fetchWallet} className="bg-white/10 hover:bg-white/20 px-3 rounded-xl border border-white/10 transition-colors text-xs text-purple-300">
                    Fetch
                </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Registering...' : 'Enlist Now'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already have a profile?{' '}
            <button 
                onClick={onSwitchToLogin}
                className="text-white hover:text-purple-400 font-medium transition-colors underline"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
