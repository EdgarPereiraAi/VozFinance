
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiParsedTransaction, TransactionType } from "./types";

// Inicialização seguindo as diretrizes de segurança e performance
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const parseVoiceInput = async (transcript: string, categories: string[]): Promise<GeminiParsedTransaction> => {
  const categoriesStr = categories.join(", ");
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-PT');

  const prompt = `Analise a seguinte transcrição de áudio em português sobre uma transação financeira.
  Extraia os dados para um formato JSON estruturado.
  
  Transcrição: "${transcript}"
  
  Regras:
  1. 'tipo': 'receita' (se ganhou/recebeu dinheiro) ou 'despesa' (se gastou/pagou algo).
  2. 'valor': extraia apenas o número (ex: "15 euros" vira 15.0).
  3. 'categoria': escolha a melhor categoria desta lista: [${categoriesStr}]. Se não houver correspondência clara, use 'Outros'.
  4. 'descricao': resuma o que foi feito de forma curta e profissional.
  
  Hoje é dia ${dateStr}. Se o utilizador mencionar "ontem" ou "hoje", leve isso em conta apenas para o contexto, mas o foco é extrair o tipo, valor, categoria e descrição.`;

  try {
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
              description: "Tipo: 'receita' ou 'despesa'",
            },
            valor: {
              type: Type.NUMBER,
              description: "Valor numérico da transação",
            },
            categoria: {
              type: Type.STRING,
              description: "Categoria da lista fornecida",
            },
            descricao: {
              type: Type.STRING,
              description: "Breve descrição",
            },
          },
          required: ["tipo", "valor", "categoria", "descricao"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("A IA não retornou conteúdo.");
    
    const parsed = JSON.parse(text.trim()) as GeminiParsedTransaction;
    
    // Normalização robusta do tipo
    const tipoLower = parsed.tipo.toLowerCase();
    if (tipoLower.includes('receit') || tipoLower.includes('ganh') || tipoLower.includes('entr')) {
      parsed.tipo = TransactionType.RECEITA;
    } else {
      parsed.tipo = TransactionType.DESPESA;
    }

    return parsed;
  } catch (error) {
    console.error("Erro no processamento Gemini:", error);
    throw new Error("Não foi possível interpretar a sua frase. Tente dizer algo como 'Gastei 10 euros em café'.");
  }
};
