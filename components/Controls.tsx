import React, { useState } from 'react';
import type { DedicationState, FontOption, Alignment } from '../types';
import { AlignLeft, AlignCenter, AlignRight, Save } from './Icons';

interface ControlsProps {
  state: DedicationState;
  setState: (newState: Partial<DedicationState>) => void;
  onSave: () => void;
  fontOptions: FontOption[];
  isLoading: boolean;
  isTextOverflowing: boolean;
}

const FONT_PRESETS = [
  { label: 'Pequeño', size: 18 },
  { label: 'Mediano', size: 25 },
  { label: 'Grande', size: 32 },
];

const ControlGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <label className="block text-sm font-semibold text-gray-300">{title}</label>
    {children}
  </div>
);

const Controls: React.FC<ControlsProps> = ({ state, setState, onSave, fontOptions, isLoading, isTextOverflowing }) => {
  const [rawSpotifyUrl, setRawSpotifyUrl] = useState('');
  const [spotifyStatus, setSpotifyStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const handleValidateSpotifyLink = () => {
    const url = rawSpotifyUrl.trim();

    if (!url) {
        setState({ spotifyUri: '' });
        setSpotifyStatus('idle');
        return;
    }

    const match = url.match(/spotify\.com\/(?:intl-es\/)?(track|album|playlist)\/([a-zA-Z0-9]+)/);
    
    if (match) {
      const [, type, id] = match;
      setState({ spotifyUri: `spotify:${type}:${id}` });
      setSpotifyStatus('valid');
    } else {
      setState({ spotifyUri: '' });
      setSpotifyStatus('invalid');
    }
  };
  
  const inputBorderColor = {
    idle: 'border-gray-600 focus:ring-purple-500 focus:border-purple-500',
    valid: 'border-green-500 ring-1 ring-green-500',
    invalid: 'border-red-500 ring-1 ring-red-500',
  }[spotifyStatus];

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 space-y-6">
      <ControlGroup title="Tu Mensaje">
        <p className="text-sm text-gray-400">
          Haz clic directamente en la caja de texto de la tarjeta para editar tu dedicatoria.
        </p>
      </ControlGroup>

      <ControlGroup title="Canción de Spotify (Opcional)">
        <div className="flex items-center gap-2">
         <input
          type="text"
          className={`flex-grow p-3 bg-gray-700 border rounded-lg transition ${inputBorderColor}`}
          placeholder="Pega el enlace de la canción aquí"
          value={rawSpotifyUrl}
          onChange={(e) => setRawSpotifyUrl(e.target.value)}
        />
        <button onClick={handleValidateSpotifyLink} className="py-3 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition">
          Aplicar
        </button>
        </div>
        {spotifyStatus === 'invalid' && <p className="text-xs text-red-400 mt-1">Enlace no válido. Asegúrate de pegar un enlace completo de Spotify.</p>}
        {spotifyStatus === 'valid' && <p className="text-xs text-green-400 mt-1">¡Enlace de Spotify válido!</p>}
      </ControlGroup>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ControlGroup title="Fuente">
          <select
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            value={state.fontFamily}
            onChange={(e) => setState({ fontFamily: e.target.value })}
          >
            {fontOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </ControlGroup>

        <ControlGroup title="Tamaño de Letra">
          <div className="flex gap-2 mb-3">
            {FONT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setState({ fontSize: preset.size })}
                disabled={isTextOverflowing}
                className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition ${
                  state.fontSize === preset.size && !isTextOverflowing ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
              type="number"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition disabled:opacity-50"
              value={state.fontSize}
              onChange={(e) => setState({ fontSize: parseInt(e.target.value, 10) || 10 })}
              min="10"
              max="100"
              disabled={isTextOverflowing}
          />
          {isTextOverflowing && <p className="text-xs text-yellow-400 mt-2">Tamaño de letra ajustado para encajar el texto.</p>}
        </ControlGroup>
      </div>

      <ControlGroup title="Alineación">
        <div className="flex justify-between items-center bg-gray-700 rounded-lg p-1">
          {(['left', 'center', 'right'] as Alignment[]).map((align) => (
            <button
              key={align}
              onClick={() => setState({ alignment: align })}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition flex justify-center items-center gap-2 ${
                state.alignment === align ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              {align === 'left' && <AlignLeft />}
              {align === 'center' && <AlignCenter />}
              {align === 'right' && <AlignRight />}
              <span className="capitalize hidden sm:inline">{align}</span>
            </button>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup title="Posición Vertical">
        <input
          type="range"
          min="50"
          max="100"
          value={state.positionY}
          onChange={(e) => setState({ positionY: parseInt(e.target.value, 10) })}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </ControlGroup>

      <button
        onClick={onSave}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Generando...
          </>
        ) : (
          <>
            <Save />
            Guardar Imagen
          </>
        )}
      </button>
    </div>
  );
};

export default Controls;
