import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import type { DedicationState } from '../types';
import { BACKGROUND_IMAGE_URL, WORD_LIMIT } from '../constants';

interface PreviewProps {
  state: DedicationState;
  onTextChange: (newText: string) => void;
  setFontSize: (size: number) => void;
  setIsOverflowing: (isOverflowing: boolean) => void;
}

const Preview = React.forwardRef<HTMLDivElement, PreviewProps>(({ state, onTextChange, setFontSize, setIsOverflowing }, ref) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const textBoxContainerRef = useRef<HTMLDivElement>(null);
  const [scaledFontSize, setScaledFontSize] = useState(state.fontSize);

  const spotifyCodeUrl = useMemo(() => {
    if (state.spotifyUri && state.spotifyUri.startsWith('spotify:')) {
      return `https://scannables.scdn.co/uri/plain/png/FFFFFF/black/640/${state.spotifyUri}`;
    }
    return null;
  }, [state.spotifyUri]);

  const currentWordCount = useMemo(() => {
    return state.text.trim().split(/\s+/).filter(Boolean).length;
  }, [state.text]);

  useLayoutEffect(() => {
    const container = (ref && typeof ref !== 'function') ? ref.current : null;
    if (!container) return;

    const CANONICAL_WIDTH = 400; 

    const updateScaledFontSize = () => {
      const currentWidth = container.clientWidth;
      const scale = currentWidth / CANONICAL_WIDTH;
      setScaledFontSize(state.fontSize * scale);
    };

    const resizeObserver = new ResizeObserver(updateScaledFontSize);
    resizeObserver.observe(container);
    updateScaledFontSize();

    return () => resizeObserver.disconnect();
  }, [ref, state.fontSize]);

  useLayoutEffect(() => {
    if (!isImageLoaded || !textRef.current || !textBoxContainerRef.current) return;

    const textEl = textRef.current;
    const containerEl = textBoxContainerRef.current;
    
    const isOverflowing = textEl.scrollHeight > containerEl.clientHeight + 2;

    if (isOverflowing) {
      setIsOverflowing(true);
      if (state.fontSize > 10) {
        setFontSize(state.fontSize - 1);
      }
    } else {
      setIsOverflowing(false);
    }
  }, [state.text, scaledFontSize, isImageLoaded, setFontSize, setIsOverflowing, state.fontSize]);

  return (
    <div ref={ref} className="w-full max-w-xl mx-auto lg:max-w-none">
      <div 
        className="relative aspect-[2/3] bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-700"
      >
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={BACKGROUND_IMAGE_URL}
          alt="Tarjeta de dedicatoria"
          className={`w-full h-full object-cover transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsImageLoaded(true)}
          crossOrigin="anonymous"
        />
        {isImageLoaded && (
          <>
            {spotifyCodeUrl && (
              <div 
                className="absolute left-0 right-0 px-[20%]"
                style={{ top: '25%', transform: 'translateY(-50%)' }}
              >
                 <img 
                    src={spotifyCodeUrl}
                    alt="Spotify Code"
                    className="w-full h-auto object-contain"
                    crossOrigin="anonymous"
                 />
              </div>
            )}
            
            <div
              ref={textBoxContainerRef}
              className="absolute left-0 right-0 mx-[8%] p-4 outline-dashed outline-2 outline-purple-500/70 rounded-lg bg-black bg-opacity-10 pointer-events-none flex flex-col"
              style={{
                top: '60%',
                bottom: '4%',
              }}
            >
                <div
                  ref={textRef}
                  contentEditable
                  suppressContentEditableWarning={true}
                  onInput={(e) => onTextChange(e.currentTarget.innerText)}
                  className="w-full h-full cursor-text pointer-events-auto overflow-y-hidden"
                  style={{
                      textAlign: state.alignment,
                      fontFamily: state.fontFamily,
                      fontSize: `${scaledFontSize}px`,
                      lineHeight: 1.3,
                      color: 'black',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                  }}
                >
                  {state.text}
                </div>
                <div className={`absolute bottom-2 right-3 text-xs font-semibold pointer-events-none ${
                  currentWordCount > WORD_LIMIT ? 'text-red-500' : 'text-gray-800'
                }`}>
                  {currentWordCount} / {WORD_LIMIT} palabras
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default Preview;