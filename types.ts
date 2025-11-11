
export type Alignment = 'left' | 'center' | 'right';

export interface FontOption {
  value: string;
  label: string;
}

export interface DedicationState {
  text: string;
  fontSize: number;
  fontFamily: string;
  alignment: Alignment;
  positionY: number;
  spotifyUri: string;
}
