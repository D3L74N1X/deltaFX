export type AssetKind = "image" | "video" | "audio" | "model";

export type PresetPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "custom";

export type AnimationType =
  | "fade"
  | "scale"
  | "bounce"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right";

export interface EffectConfig {
  id: string;
  name: string;
  /** Dateiname im Asset-Verzeichnis (AppData/assets) */
  fileName: string;
  originalName: string;
  kind: AssetKind;
  position: PresetPosition;
  /** Nur bei position === "custom", in Prozent (0–100) */
  customX: number;
  customY: number;
  /** Breite des Effekts in Prozent der Overlay-Breite */
  size: number;
  animation: AnimationType;
  /** Anzeigedauer in ms. 0 = natürliche Länge (Video/Audio spielt bis zum Ende) */
  durationMs: number;
  /** 0–1, nur für Video/Audio */
  volume: number;
  loop: boolean;
  /** Globaler Shortcut, z. B. "Control+Shift+1", null = keiner */
  hotkey: string | null;
}

export interface TriggerPayload {
  effect: EffectConfig;
}

export const DEFAULT_DURATIONS: Record<AssetKind, number> = {
  image: 5000,
  video: 0,
  audio: 0,
  model: 8000,
};
