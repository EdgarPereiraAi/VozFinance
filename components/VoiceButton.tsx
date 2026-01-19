
import React, { useState, useEffect } from 'react';

interface VoiceButtonProps {
  onResult: (transcript: string) => void;
  onError: (message: string) => void;
  isProcessing: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ onResult, onError, isProcessing }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'pt-PT';
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        setIsListening(false);
        console.error("Speech Recognition Error:", event.error);
        
        switch (event.error) {
          case 'not-allowed':
            onError("Permissão de microfone negada pelo navegador.");
            break;
          case 'no-speech':
            onError("Não ouvimos nada. Tente falar novamente.");
            break;
          case 'network':
            onError("Erro de rede ao processar a voz.");
            break;
          case 'audio-capture':
            onError("Não foi possível capturar o áudio. Verifique o seu microfone.");
            break;
          default:
            onError("Ocorreu um erro ao tentar ouvir. Tente novamente.");
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onResult, onError]);

  const toggleListening = () => {
    if (!recognition) {
      onError("Desculpe, o seu navegador não suporta reconhecimento de voz.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setIsListening(true);
      onError(""); // Limpar erros anteriores
      try {
        recognition.start();
      } catch (e) {
        console.error("Failed to start recognition:", e);
        setIsListening(false);
        onError("Não foi possível iniciar o microfone.");
      }
    }
  };

  return (
    <button
      onClick={toggleListening}
      disabled={isProcessing}
      className={`
        relative group flex items-center justify-center gap-3 px-8 py-3 rounded-2xl font-bold transition-all duration-300
        ${isListening 
          ? 'bg-rose-500 text-white shadow-rose-200 shadow-xl scale-105' 
          : 'bg-indigo-600 text-white shadow-indigo-200 shadow-xl hover:bg-indigo-700 hover:-translate-y-0.5'}
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isProcessing ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>A processar...</span>
        </div>
      ) : (
        <>
          <div className="relative">
            {isListening && (
              <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-50"></span>
            )}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span>{isListening ? 'A ouvir...' : 'Falar Gasto'}</span>
        </>
      )}
    </button>
  );
};

export default VoiceButton;
