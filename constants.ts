import type { FontOption, DedicationState } from './types';

export const BACKGROUND_IMAGE_URL = 'https://cdn.shopify.com/s/files/1/0649/4083/4883/files/NUEVA_TARJETA_VITORA_7.png?v=1756765704';

export const FONT_OPTIONS: FontOption[] = [
    { value: "'Times New Roman', Times, serif", label: "Times New Roman" },
    { value: "Arial, sans-serif", label: "Arial" },
    { value: "'Courier New', Courier, monospace", label: "Courier New" },
    { value: "Georgia, serif", label: "Georgia" },
    { value: "'Brush Script MT', cursive", label: "Script" }
];

export const DEFAULT_STATE: DedicationState = {
    text: "Escribe tu dedicatoria aquí...",
    fontSize: 25,
    fontFamily: "'Times New Roman', Times, serif",
    alignment: 'center',
    positionY: 75,
    spotifyUri: '',
};

export const WORD_LIMIT = 150;
