
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
        if (event.error === 'aborted' || (event.error === 'no-speech' && isListening)) {
          setIsListening(false);
          return;
        }

        console.error("Erro no reconhecimento:", event.error);
        setIsListening(false);
        
        const errorMessages: Record<string, string> = {
          'not-allowed': "Permissão de microfone negada.",
          'network': "Problema de ligação à internet.",
          'audio-capture': "Erro ao aceder ao microfone."
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
        onError(""); 
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
        relative flex items-center justify-center gap-4 px-12 py-6 rounded-2xl font-black transition-all duration-500 transform
        ${isListening 
          ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-2xl shadow-rose-200 ring-8 ring-rose-100 dark:ring-rose-900/20 scale-105' 
          : 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-xl shadow-indigo-100 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-200 hover:-translate-y-1 active:scale-95'}
        ${isProcessing ? 'opacity-50 cursor-not-allowed scale-100' : ''}
      `}
    >
      {isProcessing ? (
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xl uppercase tracking-wider">A processar...</span>
        </div>
      ) : (
        <>
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <span className="absolute h-12 w-12 rounded-full bg-white animate-ping opacity-30"></span>
                <span className="absolute h-16 w-16 rounded-full bg-white animate-pulse opacity-20"></span>
              </>
            )}
            <svg className="w-8 h-8 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="text-xl uppercase tracking-tighter whitespace-nowrap">
            {isListening ? 'A ouvir agora...' : 'Falar Gasto'}
          </span>
        </>
      )}
    </button>
  );
};

export default VoiceButton;
