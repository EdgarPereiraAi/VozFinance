
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { GeminiParsedTransaction, TransactionType } from "./types";

// Inicialização seguindo as diretrizes de segurança e performance
const getAIInstance = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("A chave da API Gemini (VITE_GEMINI_API_KEY) não foi configurada. Por favor, adicione-a às variáveis de ambiente.");
  }
  return new GoogleGenAI({ apiKey });
};

export const parseVoiceInput = async (transcript: string, categories: string[]): Promise<GeminiParsedTransaction> => {
  const ai = getAIInstance();
  const categoriesStr = categories.join(", ");
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-PT');

  const prompt = `Extraia dados da transcrição: "${transcript}"
Categorias: ${categoriesStr}
Data: ${dateStr}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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
