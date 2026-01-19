
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from './types';
import { parseVoiceInput } from './geminiService';
import Summary from './components/Summary';
import TransactionTable from './components/TransactionTable';
import TransactionForm from './components/TransactionForm';
import VoiceButton from './components/VoiceButton';
import CategoryManager from './components/CategoryManager';
import { useTheme } from './contexts/ThemeContext';

const DEFAULT_CATEGORIES = ['Alimentação', 'Transporte', 'Lazer', 'Trabalho', 'Saúde', 'Outros'];

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const [draftTransaction, setDraftTransaction] = useState<Partial<Transaction> | null>(null);

  useEffect(() => {
    const savedTrans = localStorage.getItem('voz_finance_transactions');
    if (savedTrans) {
      try { setTransactions(JSON.parse(savedTrans)); } catch (e) {}
    }
    const savedCats = localStorage.getItem('voz_finance_categories');
    if (savedCats) {
      try { setCategories(JSON.parse(savedCats)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const saveTransactions = (data: Transaction[]) => {
    localStorage.setItem('voz_finance_transactions', JSON.stringify(data));
  };

  const saveCategories = (data: string[]) => {
    localStorage.setItem('voz_finance_categories', JSON.stringify(data));
  };

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...transaction, id: crypto.randomUUID() };
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
    setIsFormVisible(false);
    setDraftTransaction(null);
    setLastTranscript(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleAddCategory = (cat: string) => {
    const updated = [...categories, cat];
    setCategories(updated);
    saveCategories(updated);
  };

  const handleRemoveCategory = (cat: string) => {
    const updated = categories.filter(c => c !== cat);
    setCategories(updated);
    saveCategories(updated);
  };

  const onVoiceResult = async (transcript: string) => {
    setIsProcessing(true);
    setError(null);
    setLastTranscript(transcript);
    try {
      const parsed = await parseVoiceInput(transcript, categories);
      const now = new Date();
      setDraftTransaction({
        ...parsed,
        data: now.toISOString().split('T')[0],
        hora: now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
      });
      setIsFormVisible(true);
    } catch (err: any) {
      setError(err.message || "Não conseguimos interpretar a frase.");
    } finally { 
      setIsProcessing(false); 
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tighter mb-2">
              Voz<span className="text-indigo-600 dark:text-indigo-400">Finance</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">O seu assistente financeiro por voz.</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm ml-2"
          >
            {theme === 'light' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
            )}
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCatManagerOpen(true)}
              className="px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              Categorias
            </button>
            <button 
              onClick={() => { setDraftTransaction(null); setLastTranscript(null); setIsFormVisible(!isFormVisible); }}
              className="px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              {isFormVisible ? 'Fechar' : 'Novo'}
            </button>
          </div>
          <VoiceButton onResult={onVoiceResult} onError={(m) => setError(m)} isProcessing={isProcessing} />
        </div>
      </header>

      {lastTranscript && isProcessing && (
        <div className="mb-8 p-8 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/30 rounded-[2rem] animate-pulse">
          <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">A interpretar áudio...</p>
          <p className="text-2xl font-bold italic text-indigo-900 dark:text-indigo-100">"{lastTranscript}"</p>
        </div>
      )}

      {isCatManagerOpen && (
        <CategoryManager 
          categories={categories} 
          onAdd={handleAddCategory} 
          onRemove={handleRemoveCategory} 
          onClose={() => setIsCatManagerOpen(false)} 
        />
      )}

      {error && (
        <div className="mb-8 p-5 bg-white dark:bg-slate-900 border-l-8 border-rose-500 rounded-r-3xl shadow-xl animate-in slide-in-from-left duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-xl text-rose-600 dark:text-rose-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-slate-300 hover:text-slate-500 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
          </div>
        </div>
      )}

      {isFormVisible && (
        <div className="mb-12">
          <TransactionForm 
            categories={categories}
            initialData={draftTransaction || undefined} 
            onSubmit={handleAddTransaction} 
            onCancel={() => { setIsFormVisible(false); setDraftTransaction(null); setLastTranscript(null); }}
          />
        </div>
      )}

      <Summary transactions={transactions} />

      <div className="mt-12 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight">Transações Recentes</h2>
          <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-4 py-2 rounded-full">{transactions.length} registos</span>
        </div>
        <TransactionTable transactions={transactions} onDelete={handleDeleteTransaction} />
      </div>
    </div>
  );
};

export default App;
