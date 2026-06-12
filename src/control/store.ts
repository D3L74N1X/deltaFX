import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { emitTo } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import type { EffectConfig, TriggerPayload } from "../types";
import { DEFAULT_DURATIONS } from "../types";
import {
  EVT_CLEAR_QUEUE,
  EVT_SHOW_GUIDES,
  EVT_TRIGGER_EFFECT,
  OVERLAY_WINDOW,
} from "../lib/events";

interface ImportedAsset {
  fileName: string;
  originalName: string;
  kind: EffectConfig["kind"];
}

interface ControlState {
  effects: EffectConfig[];
  selectedId: string | null;
  clickThrough: boolean;
  showGuides: boolean;
  loading: boolean;
  error: string | null;

  load: () => Promise<void>;
  importAssets: () => Promise<void>;
  updateEffect: (id: string, patch: Partial<EffectConfig>) => void;
  removeEffect: (id: string) => Promise<void>;
  select: (id: string | null) => void;
  trigger: (id: string) => Promise<void>;
  clearQueue: () => Promise<void>;
  setClickThrough: (enabled: boolean) => Promise<void>;
  setShowGuides: (enabled: boolean) => Promise<void>;
  dismissError: () => void;
}

function persist(effects: EffectConfig[]) {
  void invoke("save_effects", { json: JSON.stringify(effects, null, 2) }).catch(
    (e) => console.error("Speichern fehlgeschlagen:", e),
  );
}

export const useControlStore = create<ControlState>((set, get) => ({
  effects: [],
  selectedId: null,
  clickThrough: false,
  showGuides: false,
  loading: true,
  error: null,

  load: async () => {
    try {
      const json = await invoke<string>("load_effects");
      const effects = JSON.parse(json) as EffectConfig[];
      set({ effects, loading: false, selectedId: effects[0]?.id ?? null });
    } catch (e) {
      set({ loading: false, error: `Konfiguration konnte nicht geladen werden: ${e}` });
    }
  },

  importAssets: async () => {
    const picked = await open({
      multiple: true,
      title: "Medien importieren",
      filters: [
        {
          name: "Medien",
          extensions: [
            "png", "jpg", "jpeg", "gif", "webp", "avif",
            "webm", "mp4", "mov",
            "mp3", "wav", "ogg", "flac",
            "glb", "gltf",
          ],
        },
      ],
    });
    if (!picked) return;
    const paths = Array.isArray(picked) ? picked : [picked];

    const added: EffectConfig[] = [];
    for (const srcPath of paths) {
      try {
        const asset = await invoke<ImportedAsset>("import_asset", { srcPath });
        added.push({
          id: crypto.randomUUID(),
          name: asset.originalName.replace(/\.[^.]+$/, ""),
          fileName: asset.fileName,
          originalName: asset.originalName,
          kind: asset.kind,
          position: "center",
          customX: 50,
          customY: 50,
          size: 30,
          animation: "fade",
          durationMs: DEFAULT_DURATIONS[asset.kind],
          volume: 0.8,
          loop: false,
          hotkey: null,
        });
      } catch (e) {
        set({ error: `Import fehlgeschlagen: ${e}` });
      }
    }
    if (added.length > 0) {
      const effects = [...get().effects, ...added];
      set({ effects, selectedId: added[added.length - 1].id });
      persist(effects);
    }
  },

  updateEffect: (id, patch) => {
    const effects = get().effects.map((fx) =>
      fx.id === id ? { ...fx, ...patch } : fx,
    );
    set({ effects });
    persist(effects);
  },

  removeEffect: async (id) => {
    const fx = get().effects.find((f) => f.id === id);
    if (!fx) return;
    try {
      await invoke("delete_asset", { fileName: fx.fileName });
    } catch (e) {
      console.warn("Asset-Datei konnte nicht gelöscht werden:", e);
    }
    const effects = get().effects.filter((f) => f.id !== id);
    set({
      effects,
      selectedId: get().selectedId === id ? (effects[0]?.id ?? null) : get().selectedId,
    });
    persist(effects);
  },

  select: (id) => set({ selectedId: id }),

  trigger: async (id) => {
    const effect = get().effects.find((f) => f.id === id);
    if (!effect) return;
    const payload: TriggerPayload = { effect };
    await emitTo(OVERLAY_WINDOW, EVT_TRIGGER_EFFECT, payload);
  },

  clearQueue: async () => {
    await emitTo(OVERLAY_WINDOW, EVT_CLEAR_QUEUE, null);
  },

  setClickThrough: async (enabled) => {
    try {
      await invoke("set_clickthrough", { enabled });
      set({ clickThrough: enabled });
    } catch (e) {
      set({ error: `Click-through konnte nicht gesetzt werden: ${e}` });
    }
  },

  setShowGuides: async (enabled) => {
    set({ showGuides: enabled });
    await emitTo(OVERLAY_WINDOW, EVT_SHOW_GUIDES, enabled);
  },

  dismissError: () => set({ error: null }),
}));
