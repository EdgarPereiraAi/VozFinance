import React from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const getCategoryColor = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('alimentação') || cat.includes('comida') || cat.includes('restaurante')) {
    return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  }
  if (cat.includes('transporte') || cat.includes('combustível') || cat.includes('carro')) {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  }
  if (cat.includes('lazer') || cat.includes('diversão') || cat.includes('viagem')) {
    return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
  }
  if (cat.includes('salário') || cat.includes('trabalho') || cat.includes('rendimento')) {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
  }
  if (cat.includes('saúde') || cat.includes('farmácia') || cat.includes('médico')) {
    return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
  }
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
};

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
    <div className="flex flex-col">
      {/* Desktop Header */}
      <div className="hidden md:grid grid-cols-12 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider px-8 py-4">
        <div className="col-span-2">Data/Hora</div>
        <div className="col-span-5">Descrição</div>
        <div className="col-span-2">Categoria</div>
        <div className="col-span-2 text-right">Valor</div>
        <div className="col-span-1"></div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {transactions.map((t) => (
          <div key={t.id} className="grid grid-cols-1 md:grid-cols-12 items-center px-6 md:px-8 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group relative">
            {/* Mobile/Desktop Date */}
            <div className="col-span-2 mb-2 md:mb-0">
              <div className="text-slate-900 dark:text-slate-200 font-bold md:font-medium text-sm">
                {new Date(t.data).toLocaleDateString('pt-PT')}
              </div>
              <div className="text-slate-400 text-xs">{t.hora || '--:--'}</div>
            </div>

            {/* Description */}
            <div className="col-span-5 mb-3 md:mb-0">
              <div className="text-base md:text-sm font-black md:font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                {t.descricao}
              </div>
            </div>

            {/* Category Tag */}
            <div className="col-span-2 mb-4 md:mb-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider ${getCategoryColor(t.categoria)}`}>
                {t.categoria}
              </span>
            </div>

            {/* Value */}
            <div className={`col-span-2 text-left md:text-right text-lg md:text-sm font-black md:font-bold ${t.tipo === TransactionType.RECEITA ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {t.tipo === TransactionType.RECEITA ? '+' : '-'} {t.valor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </div>

            {/* Delete Button */}
            <div className="col-span-1 text-right absolute top-5 right-6 md:relative md:top-0 md:right-0">
              <button 
                onClick={() => onDelete(t.id)}
                className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors md:opacity-0 md:group-hover:opacity-100"
                title="Apagar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionTable;