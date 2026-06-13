import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

export default function AuthModal() {
  const { isAuthOpen, closeAuth } = useModal();
  const { login, register, error, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setFormError(null);
    clearError();
  };

  const handleClose = () => {
    resetForm();
    closeAuth();
  };

  const switchTab = (tab: 'signin' | 'register') => {
    setActiveTab(tab);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();
    setIsLoading(true);

    try {
      if (activeTab === 'signin') {
        await login(email, password);
        handleClose();
      } else {
        if (!name.trim()) {
          setFormError('Please enter your name');
          setIsLoading(false);
          return;
        }
        await register(name, email, password);
        handleClose();
      }
    } catch (_err) {
      // Error is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-[420px] bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full text-[#666666] hover:text-white hover:bg-[#222222] transition-colors duration-200"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="px-8 pt-8 pb-4">
              <h2
                className="text-[1.5rem] font-bold text-white tracking-[-0.02em]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {activeTab === 'signin' ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p className="mt-1 text-[0.875rem] text-[#999999]">
                {activeTab === 'signin'
                  ? 'Sign in to access your dictionary and stats'
                  : 'Create an account to start building your slang vocabulary'}
              </p>
            </div>

            {/* Tabs */}
            <div className="px-8 mb-4">
              <div className="flex bg-[#1A1A1A] rounded-lg p-1">
                <button
                  onClick={() => switchTab('signin')}
                  className="flex-1 py-2 text-[0.875rem] font-medium rounded-md transition-all duration-200"
                  style={{
                    backgroundColor: activeTab === 'signin' ? '#E50914' : 'transparent',
                    color: activeTab === 'signin' ? '#FFFFFF' : '#999999',
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchTab('register')}
                  className="flex-1 py-2 text-[0.875rem] font-medium rounded-md transition-all duration-200"
                  style={{
                    backgroundColor: activeTab === 'register' ? '#E50914' : 'transparent',
                    color: activeTab === 'register' ? '#FFFFFF' : '#999999',
                  }}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pb-8">
              <div className="flex flex-col gap-4">
                {/* Name field - register only */}
                <AnimatePresence mode="wait">
                  {activeTab === 'register' && (
                    <motion.div
                      key="name-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-[0.8125rem] font-medium text-[#999999] mb-1.5">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full h-[44px] bg-[#1A1A1A] border border-[#222222] rounded-lg px-4 text-[0.9375rem] text-white placeholder-[#666666] outline-none transition-all duration-200 focus:border-[#E50914] focus:shadow-[0_0_0_2px_#E5091480]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#999999] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-[44px] bg-[#1A1A1A] border border-[#222222] rounded-lg px-4 text-[0.9375rem] text-white placeholder-[#666666] outline-none transition-all duration-200 focus:border-[#E50914] focus:shadow-[0_0_0_2px_#E5091480]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#999999] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={activeTab === 'register' ? 'Min. 6 characters' : 'Your password'}
                    required
                    minLength={6}
                    className="w-full h-[44px] bg-[#1A1A1A] border border-[#222222] rounded-lg px-4 text-[0.9375rem] text-white placeholder-[#666666] outline-none transition-all duration-200 focus:border-[#E50914] focus:shadow-[0_0_0_2px_#E5091480]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {(error || formError) && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[0.8125rem] font-medium text-[#EF4444] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg px-4 py-2.5"
                    >
                      {formError || error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[44px] flex items-center justify-center gap-2 bg-[#E50914] text-white font-semibold text-[0.875rem] rounded-lg transition-all duration-200 hover:bg-[#B20710] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#E50914] mt-1"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : activeTab === 'signin' ? (
                    'Sign In'
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
