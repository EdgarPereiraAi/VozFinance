
export enum TransactionType {
  RECEITA = 'receita',
  DESPESA = 'despesa'
}

export interface Transaction {
  id: string;
  tipo: TransactionType;
  valor: number;
  categoria: string;
  data: string;
  hora: string;
  descricao: string;
}

export interface GeminiParsedTransaction {
  tipo: TransactionType;
  valor: number;
  categoria: string;
  descricao: string;
}
