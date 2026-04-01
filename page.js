'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import ClaimInput from '@/components/ClaimInput';
import LoadingState from '@/components/LoadingState';
import ResultCard from '@/components/ResultCard';
import HistoryPanel from '@/components/HistoryPanel';
import AdSection from '@/components/AdSection';
import Pricing from '@/components/Pricing';
import LimitModal from '@/components/LimitModal';
import { useHistory } from '@/hooks/useHistory';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const [apiStatus, setApiStatus] = useState('normal');
  const { history, addToHistory, clearHistory } = useHistory();

  const handleVerify = useCallback(async (claim) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.limitReached) {
          setShowLimit(true);
          setApiStatus('limited');
          return;
        }
        if (response.status === 503) {
          setApiStatus('limited');
        }
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }

      if (data.fallback) {
        setApiStatus('backup');
      } else {
        setApiStatus('normal');
      }

      setResult(data);
      addToHistory(data);
    } catch (err) {
      setError('Unable to connect. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [addToHistory]);

  const handleNewCheck = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const handleSelectHistory = useCallback((item) => {
    setResult(item);
    setError(null);
  }, []);

  return (
    <div className="relative min-h-screen bg-grid-pattern">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-indigo-600/5 blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/3 blur-3xl animate-glow-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header apiStatus={apiStatus} />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          {/* Hero section with Main Search */}
          <section className="pt-8 sm:pt-16">
            {!result && !isLoading && (
              <ClaimInput onSubmit={handleVerify} isLoading={isLoading} />
            )}
            
            {/* Horizontal Ad Unit 1 */}
            {!isLoading && <AdSection type="leaderboard" />}

            {/* Loading animation */}
            {isLoading && <LoadingState />}

            {/* Error state */}
            {error && !isLoading && (
              <div className="w-full max-w-lg mx-auto mt-8 animate-in">
                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-red-400 font-semibold text-sm">Verification Failed</h3>
                      <p className="text-slate-400 text-sm mt-1">{error}</p>
                      <button
                        onClick={handleNewCheck}
                        className="mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Result */}
            {result && !isLoading && (
              <ResultCard result={result} onNewCheck={handleNewCheck} />
            )}
          </section>

          {/* History section */}
          {!isLoading && (
            <section className="mt-8">
              <HistoryPanel
                history={history}
                onSelect={handleSelectHistory}
                onClear={clearHistory}
              />
            </section>
          )}

          {/* Footer */}
          <footer className="mt-20 text-center pb-20">
            <div className="inline-flex items-center gap-2 text-xs text-slate-600">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              VeriCheck uses AI to analyze claims. Results are informational, not definitive.
            </div>
          </footer>
        </main>
      </div>

      {showPricing && <Pricing onClose={() => setShowPricing(false)} />}
      {showLimit && (
        <LimitModal 
          onClose={() => setShowLimit(false)} 
          onUpgrade={() => {
            setShowLimit(false);
            setShowPricing(true);
          }} 
        />
      )}
    </div>
  );
}
