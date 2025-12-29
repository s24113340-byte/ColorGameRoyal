
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type Faction = 'Fire' | 'Water' | 'Nature' | 'Light';
export type Champion = 'Ren' | 'Rei';
export type HexColor = string;
export type GamePhase = 'title' | 'champion-select' | 'playing';

// Added missing types for GeminiSlingshot
export type Point = { x: number; y: number };
export type BubbleColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface Bubble {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  color: BubbleColor;
  active: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface DebugInfo {
  screenshotBase64?: string;
  promptContext?: string;
  latency: number;
  rawResponse: string;
  parsedResponse: any;
  error?: string;
}

export interface ColorSlot {
  id: string;
  name: string;
  color: HexColor;
  faction: Faction;
  points: number;
}

export interface GameState {
  phase: GamePhase;
  hasInsertedCoin: boolean;
  score: number;
  coins: number;
  umbraHp: number;
  umbraMaxHp: number;
  elementalBalance: Record<Faction, number>;
  activeBets: Record<string, number>;
  history: string[];
  lastResult: string[];
  isRolling: boolean;
  roundTimer: number;
  streakCount: number;
  activeBuff: string | null;
}

export interface StrategicHint {
  message: string;
  rationale: string;
  recommendedColor: string;
  dangerLevel: 'Low' | 'Medium' | 'High';
}

export interface AiResponse {
  hint: StrategicHint;
  debug: any;
}

declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}
