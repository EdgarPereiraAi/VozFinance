
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiParsedTransaction, TransactionType } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const parseVoiceInput = async (transcript: string, categories: string[]): Promise<GeminiParsedTransaction> => {
  const categoriesStr = categories.join(", ");
  const prompt = `Lê esta frase de gasto em português e devolve JSON com os seguintes campos:
  - 'tipo': deve ser 'receita' ou 'despesa'.
  - 'valor': o montante numérico.
  - 'categoria': escolhe a mais adequada EXCLUSIVAMENTE entre estas opções: ${categoriesStr}. Se não encaixar em nenhuma, usa 'Outros'.
  - 'descricao': uma breve descrição do que foi dito.

  Frase: "${transcript}"`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tipo: {
            type: Type.STRING,
            description: "O tipo da transação: 'receita' ou 'despesa'.",
          },
          valor: {
            type: Type.NUMBER,
            description: "O valor numérico.",
          },
          categoria: {
            type: Type.STRING,
            description: "A categoria escolhida.",
          },
          descricao: {
            type: Type.STRING,
            description: "Descrição da transação.",
          },
        },
        required: ["tipo", "valor", "categoria", "descricao"],
      },
    },
  });

  const jsonStr = response.text.trim();
  const parsed = JSON.parse(jsonStr) as GeminiParsedTransaction;
  
  // Normalizar o tipo
  if (parsed.tipo.toLowerCase().includes('receit')) {
    parsed.tipo = TransactionType.RECEITA;
  } else {
    parsed.tipo = TransactionType.DESPESA;
  }

  return parsed;
};
