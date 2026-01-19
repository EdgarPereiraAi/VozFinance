
import React from 'react';
import { Transaction, TransactionType } from '../types';

interface SummaryProps {
  transactions: Transaction[];
}

const Summary: React.FC<SummaryProps> = ({ transactions }) => {
  const receita = transactions
    .filter(t => t.tipo === TransactionType.RECEITA)
    .reduce((acc, curr) => acc + curr.valor, 0);
    
  const despesa = transactions
    .filter(t => t.tipo === TransactionType.DESPESA)
    .reduce((acc, curr) => acc + curr.valor, 0);

  const saldo = receita - despesa;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase text-xs tracking-wider">Receitas</span>
        </div>
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {receita.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase text-xs tracking-wider">Despesas</span>
        </div>
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {despesa.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
        </div>
      </div>

      <div className={`p-8 rounded-3xl shadow-sm border ${saldo >= 0 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-rose-600 text-white border-rose-500'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${saldo >= 0 ? 'bg-indigo-500' : 'bg-rose-500'}`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <span className="font-semibold uppercase text-xs tracking-wider opacity-80">Saldo Total</span>
        </div>
        <div className="text-3xl font-extrabold">
          {saldo.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
        </div>
      </div>
    </div>
  );
};

export default Summary;
