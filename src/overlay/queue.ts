import { create } from "zustand";
import type { EffectConfig } from "../types";

export interface ActiveEffect {
  /** Eindeutig pro Wiedergabe, damit derselbe Effekt zweimal hintereinander laufen kann */
  playId: string;
  effect: EffectConfig;
  url: string;
}

interface QueueState {
  /** Wartende Effekte – werden nacheinander abgespielt, damit nichts überlappt */
  queue: ActiveEffect[];
  current: ActiveEffect | null;

  enqueue: (item: Omit<ActiveEffect, "playId">) => void;
  /** Vom Renderer aufgerufen, wenn der aktuelle Effekt fertig ist (startet Exit-Animation) */
  finishCurrent: () => void;
  /** Nach der Exit-Animation: nächsten Effekt aus der Queue holen */
  promoteNext: () => void;
  clear: () => void;
}

export const useQueue = create<QueueState>((set, get) => ({
  queue: [],
  current: null,

  enqueue: (item) => {
    const active: ActiveEffect = { ...item, playId: crypto.randomUUID() };
    if (get().current === null && get().queue.length === 0) {
      set({ current: active });
    } else {
      set({ queue: [...get().queue, active] });
    }
  },

  finishCurrent: () => set({ current: null }),

  promoteNext: () => {
    const { current, queue } = get();
    if (current !== null || queue.length === 0) return;
    const [next, ...rest] = queue;
    set({ current: next, queue: rest });
  },

  clear: () => set({ queue: [], current: null }),
}));
