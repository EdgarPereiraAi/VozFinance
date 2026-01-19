
import React, { useState, useEffect, useRef } from 'react';

interface VoiceButtonProps {
  onResult: (transcript: string) => void;
  onError: (message: string) => void;
  isProcessing: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ onResult, onError, isProcessing }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const manualStopRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'pt-PT';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        manualStopRef.current = false;
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onResult(transcript);
        }
      };

      rec.onerror = (event: any) => {
        // Ignoramos o erro 'aborted' se for causado pelo próprio código ou timeout silencioso
        if (event.error === 'aborted' || event.error === 'no-speech' && isListening) {
          setIsListening(false);
          return;
        }

        console.error("Erro no reconhecimento:", event.error);
        setIsListening(false);
        
        const errorMessages: Record<string, string> = {
          'not-allowed': "Permissão de microfone negada.",
          'network': "Problema de ligação à internet.",
          'audio-capture': "Não conseguimos aceder ao microfone."
        };
        
        if (errorMessages[event.error]) {
          onError(errorMessages[event.error]);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult, onError]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      onError("O seu navegador não suporta voz.");
      return;
    }

    if (isListening) {
      manualStopRef.current = true;
      recognitionRef.current.stop();
    } else {
      try {
        onError(""); // Limpa erros anteriores ao tentar de novo
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current.abort();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    }
  };

  return (
    <button
      onClick={toggleListening}
      disabled={isProcessing}
      className={`
        relative flex items-center justify-center gap-3 px-6 py-2.5 rounded-xl font-bold transition-all duration-300
        ${isListening 
          ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 ring-4 ring-rose-100 dark:ring-rose-900/30' 
          : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 hover:-translate-y-0.5'}
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isProcessing ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">A processar...</span>
        </div>
      ) : (
        <>
          <div className="relative flex items-center justify-center">
            {isListening && (
              <span className="absolute h-6 w-6 rounded-full bg-white animate-ping opacity-40"></span>
            )}
            <svg className="w-5 h-5 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="text-sm">{isListening ? 'A ouvir...' : 'Falar Gasto'}</span>
        </>
      )}
    </button>
  );
};

export default VoiceButton;
