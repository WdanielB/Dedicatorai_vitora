import React, { useState, useCallback, useRef } from 'react';
import Controls from './components/Controls';
import Preview from './components/Preview';
import { generateImage } from './services/canvasService';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { DedicationState, FontOption, Alignment } from './types';
import { FONT_OPTIONS, DEFAULT_STATE } from './constants';

const App: React.FC = () => {
  const [text, setText] = useLocalStorage<string>('savedText', DEFAULT_STATE.text);
  const [fontSize, setFontSize] = useLocalStorage<number>('savedFontSize', DEFAULT_STATE.fontSize);
  const [fontFamily, setFontFamily] = useLocalStorage<string>('savedFontFamily', DEFAULT_STATE.fontFamily);
  const [alignment, setAlignment] = useLocalStorage<Alignment>('savedAlignment', DEFAULT_STATE.alignment);
  const [positionY, setPositionY] = useLocalStorage<number>('savedPosY', DEFAULT_STATE.positionY);
  const [spotifyUri, setSpotifyUri] = useLocalStorage<string>('savedSpotifyUri', DEFAULT_STATE.spotifyUri);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  const state: DedicationState = {
    text,
    fontSize,
    fontFamily,
    alignment,
    positionY,
    spotifyUri,
  };

  const setState = (newState: Partial<DedicationState>) => {
    if (newState.text !== undefined) setText(newState.text);
    if (newState.fontSize !== undefined) setFontSize(newState.fontSize);
    if (newState.fontFamily !== undefined) setFontFamily(newState.fontFamily);
    if (newState.alignment !== undefined) setAlignment(newState.alignment);
    if (newState.positionY !== undefined) setPositionY(newState.positionY);
    if (newState.spotifyUri !== undefined) setSpotifyUri(newState.spotifyUri);
  };

  const handleSaveImage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await generateImage(state);
    } catch (err) {
      console.error("Failed to generate image:", err);
      setError("No se pudo generar la imagen. Revisa la consola para más detalles.");
    } finally {
      setIsLoading(false);
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            Creador de Dedicatorias
          </h1>
          <p className="mt-2 text-lg text-gray-400">Personaliza tu tarjeta con un mensaje y una canción de Spotify.</p>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Controls 
              state={state} 
              setState={setState} 
              onSave={handleSaveImage}
              fontOptions={FONT_OPTIONS}
              isLoading={isLoading}
              isTextOverflowing={isOverflowing}
            />
             {error && <p className="mt-4 text-center text-red-500">{error}</p>}
          </div>
          <div className="lg:col-span-3">
            <Preview 
              ref={previewRef} 
              state={state} 
              onTextChange={setText}
              setFontSize={setFontSize}
              setIsOverflowing={setIsOverflowing}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;