
import React, { useRef } from 'react';
import { Download, Upload, ShieldCheck } from 'lucide-react';

const BackupManager: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportBackup = () => {
    const data = {
      transactions: localStorage.getItem('voz_finance_transactions'),
      categories: localStorage.getItem('voz_finance_categories'),
      version: '1.0',
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voz-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (data.transactions) {
          localStorage.setItem('voz_finance_transactions', data.transactions);
        }
        if (data.categories) {
          localStorage.setItem('voz_finance_categories', data.categories);
        }

        alert('Backup importado com sucesso! A página será reiniciada.');
        window.location.reload();
      } catch (error) {
        console.error('Erro ao importar backup:', error);
        alert('Ficheiro de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 mt-8 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Cópia de Segurança</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Exporte os seus dados para trocar de dispositivo ou guardar um backup.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportBackup}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <Download className="w-5 h-5" />
            <span>Exportar</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-md"
          >
            <Upload className="w-5 h-5" />
            <span>Importar</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={importBackup}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
