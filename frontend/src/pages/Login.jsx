import React, { useState } from 'react';
import { Lock, User, KeyRound, UserPlus } from 'lucide-react';

export default function Login({ onLogin, registerAPI, loginAPI }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await registerAPI(username, password);
        setSuccess('Registration successful! You can now log in.');
        setIsRegister(false);
        setPassword('');
      } else {
        const data = await loginAPI(username, password);
        onLogin(data.access_token);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-[#080b11] overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-4">
            <KeyRound className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isRegister 
              ? 'Register a new administrator account' 
              : 'Sign in to access your inventory portal'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white btn-gradient flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="border-2 border-white/30 border-t-white h-5 w-5 rounded-full animate-spin"></span>
            ) : isRegister ? (
              <>
                <UserPlus className="w-5 h-5" /> Register Account
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-sm">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccess('');
            }}
            className="text-blue-400 hover:text-blue-300 font-medium transition"
          >
            {isRegister 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
