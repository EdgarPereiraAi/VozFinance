import React from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        <p className="font-medium text-lg">Nenhuma transação registada.</p>
        <p className="text-sm text-slate-500 dark:text-slate-500">Tente dizer "Gastei 15 euros no almoço ontem"</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <th className="px-8 py-4">Data/Hora</th>
            <th className="px-8 py-4">Descrição</th>
            <th className="px-8 py-4">Categoria</th>
            <th className="px-8 py-4 text-right">Valor</th>
            <th className="px-8 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
              <td className="px-8 py-5 whitespace-nowrap text-sm">
                <div className="text-slate-900 dark:text-slate-200 font-medium">
                  {new Date(t.data).toLocaleDateString('pt-PT')}
                </div>
                <div className="text-slate-400 text-xs">{t.hora || '--:--'}</div>
              </td>
              <td className="px-8 py-5">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">{t.descricao}</div>
              </td>
              <td className="px-8 py-5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {t.categoria}
                </span>
              </td>
              <td className={`px-8 py-5 text-right font-bold ${t.tipo === TransactionType.RECEITA ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                {t.tipo === TransactionType.RECEITA ? '+' : '-'} {t.valor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
              </td>
              <td className="px-8 py-5 text-right">
                <button 
                  onClick={() => onDelete(t.id)}
                  className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Apagar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;