
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
    try {
      const parsed = await parseVoiceInput(transcript, categories);
      const now = new Date();
      setDraftTransaction({
        ...parsed,
        data: now.toISOString().split('T')[0],
        hora: now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
      });
      setIsFormVisible(true);
    } catch (err) {
      setError("Não conseguimos processar a sua voz. Tente ser mais claro.");
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              Voz<span className="text-indigo-600 dark:text-indigo-400">Finance</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Controle as suas finanças apenas com a voz.</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm ml-2"
          >
            {theme === 'light' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
            )}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => setIsCatManagerOpen(true)}
            className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            Categorias
          </button>
          <VoiceButton onResult={onVoiceResult} onError={(m) => setError(m)} isProcessing={isProcessing} />
          <button 
            onClick={() => { setDraftTransaction(null); setIsFormVisible(!isFormVisible); }}
            className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center gap-2"
          >
            {isFormVisible ? 'Fechar' : 'Novo'}
          </button>
        </div>
      </header>

      {isCatManagerOpen && (
        <CategoryManager 
          categories={categories} 
          onAdd={handleAddCategory} 
          onRemove={handleRemoveCategory} 
          onClose={() => setIsCatManagerOpen(false)} 
        />
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm font-medium flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
          </div>
          {error.includes("permissão") || error.includes("microfone") ? (
            <div className="mt-1 pl-7 text-xs opacity-80 border-t border-red-200/50 dark:border-red-800/50 pt-2">
              <strong>Como resolver:</strong> Clique no ícone de cadeado ou microfone no lado esquerdo da barra de endereço do seu navegador e escolha "Permitir" para o Microfone.
            </div>
          ) : null}
        </div>
      )}

      {isFormVisible && (
        <div className="mb-12">
          <TransactionForm 
            categories={categories}
            initialData={draftTransaction || undefined} 
            onSubmit={handleAddTransaction} 
            onCancel={() => { setIsFormVisible(false); setDraftTransaction(null); }}
          />
        </div>
      )}

      <Summary transactions={transactions} />

      <div className="mt-12 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">Transações Recentes</h2>
          <span className="text-sm text-slate-400">{transactions.length} registos</span>
        </div>
        <TransactionTable transactions={transactions} onDelete={handleDeleteTransaction} />
      </div>
    </div>
  );
};

export default App;
