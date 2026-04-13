
import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameMonth,
  parseISO,
  subDays,
  subMonths,
  subYears
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction, TransactionType } from '../types';
import { Calendar, BarChart3, TrendingUp } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
}

type ViewType = 'semanal' | 'mensal' | 'anual';

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const [view, setView] = useState<ViewType>('mensal');

  const chartData = useMemo(() => {
    const now = new Date();
    let interval: { start: Date; end: Date };
    let formatStr = 'dd/MM';
    let groupingFn: (date: Date) => Date;

    if (view === 'semanal') {
      interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      groupingFn = (d) => d;
    } else if (view === 'mensal') {
      interval = { start: startOfMonth(now), end: endOfMonth(now) };
      formatStr = 'dd';
      groupingFn = (d) => d;
    } else {
      interval = { start: startOfYear(now), end: endOfYear(now) };
      formatStr = 'MMM';
      groupingFn = startOfMonth;
    }

    const periods = view === 'anual' 
      ? eachMonthOfInterval(interval)
      : eachDayOfInterval(interval);

    return periods.map(period => {
      const periodTransactions = transactions.filter(t => {
        const tDate = parseISO(t.data);
        return view === 'anual' ? isSameMonth(tDate, period) : isSameDay(tDate, period);
      });

      const receita = periodTransactions
        .filter(t => t.tipo === TransactionType.RECEITA)
        .reduce((sum, t) => sum + t.valor, 0);

      const despesa = periodTransactions
        .filter(t => t.tipo === TransactionType.DESPESA)
        .reduce((sum, t) => sum + t.valor, 0);

      return {
        name: format(period, formatStr, { locale: ptBR }),
        receita,
        despesa,
        total: receita - despesa
      };
    });
  }, [transactions, view]);

  const stats = useMemo(() => {
    const totalReceita = transactions
      .filter(t => t.tipo === TransactionType.RECEITA)
      .reduce((sum, t) => sum + t.valor, 0);
    const totalDespesa = transactions
      .filter(t => t.tipo === TransactionType.DESPESA)
      .reduce((sum, t) => sum + t.valor, 0);
    
    return {
      totalReceita,
      totalDespesa,
      balance: totalReceita - totalDespesa
    };
  }, [transactions]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8 mt-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Análise de Fluxo
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Visualize o seu desempenho financeiro</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          {(['semanal', 'mensal', 'anual'] as ViewType[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                view === v 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip 
              cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                backgroundColor: '#fff',
                padding: '12px 16px'
              }}
              itemStyle={{ fontWeight: 700, fontSize: '14px' }}
              labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
              formatter={(value: any) => [`${Number(value).toLocaleString('pt-PT')}€`]}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 700 }}
            />
            <Bar 
              dataKey="receita" 
              name="Receitas" 
              fill="#10b981" 
              radius={[6, 6, 0, 0]} 
              barSize={view === 'anual' ? 30 : 15}
            />
            <Bar 
              dataKey="despesa" 
              name="Despesas" 
              fill="#ef4444" 
              radius={[6, 6, 0, 0]} 
              barSize={view === 'anual' ? 30 : 15}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Média Diária</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {(stats.totalReceita / chartData.length).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Período Ativo</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stats.balance >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
            <TrendingUp className={`w-6 h-6 ${stats.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} ${stats.balance < 0 ? 'rotate-180' : ''}`} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taxa de Poupança</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {stats.totalReceita > 0 ? ((stats.balance / stats.totalReceita) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
