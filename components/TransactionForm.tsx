
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionFormProps {
  categories: string[];
  initialData?: Partial<Transaction>;
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ categories, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    tipo: initialData?.tipo || TransactionType.DESPESA,
    valor: initialData?.valor || 0,
    categoria: initialData?.categoria || categories[0] || '',
    data: initialData?.data || new Date().toISOString().split('T')[0],
    hora: initialData?.hora || new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    descricao: initialData?.descricao || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        tipo: initialData.tipo || TransactionType.DESPESA,
        valor: initialData.valor || 0,
        categoria: initialData.categoria || categories[0] || '',
        data: initialData.data || new Date().toISOString().split('T')[0],
        hora: initialData.hora || new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        descricao: initialData.descricao || '',
      });
    }
  }, [initialData, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.valor || !formData.descricao || !formData.categoria) return;
    onSubmit(formData as Omit<Transaction, 'id'>);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in slide-in-from-top-4 duration-300">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Confirmar Detalhes</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tipo</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipo: TransactionType.RECEITA })}
              className={`py-3 px-4 rounded-xl border font-bold transition-all ${formData.tipo === TransactionType.RECEITA ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-500'}`}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipo: TransactionType.DESPESA })}
              className={`py-3 px-4 rounded-xl border font-bold transition-all ${formData.tipo === TransactionType.DESPESA ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-700 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-500'}`}
            >
              Despesa
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="valor" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Valor (€)</label>
          <input
            id="valor"
            type="number"
            step="0.01"
            required
            value={formData.valor || ''}
            onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="categoria" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Categoria</label>
          <select
            id="categoria"
            required
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="data" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Data</label>
            <input
              id="data"
              type="date"
              required
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-all"
            />
          </div>
          <div>
            <label htmlFor="hora" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Hora</label>
            <input
              id="hora"
              type="time"
              required
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-all"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="descricao" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Descrição</label>
          <input
            id="descricao"
            type="text"
            required
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="O que comprou ou recebeu?"
          />
        </div>

        <div className="md:col-span-2 flex justify-end gap-4 pt-4">
          <button type="button" onClick={onCancel} className="px-6 py-3 text-slate-500 font-semibold hover:text-slate-700 transition-colors">
            Cancelar
          </button>
          <button type="submit" className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
