import { useEffect } from "react";
import {
  register,
  unregisterAll,
} from "@tauri-apps/plugin-global-shortcut";
import { useControlStore } from "./store";

/**
 * Registriert für jeden Effekt mit Hotkey einen globalen Shortcut.
 * Globale Shortcuts funktionieren auch, wenn der Streamer gerade im
 * Spiel ist und die App nicht den Fokus hat.
 */
export function useGlobalHotkeys() {
  const effects = useControlStore((s) => s.effects);
  const trigger = useControlStore((s) => s.trigger);

  useEffect(() => {
    let cancelled = false;

    const apply = async () => {
      await unregisterAll().catch(() => {});
      if (cancelled) return;

      for (const fx of effects) {
        if (!fx.hotkey) continue;
        const id = fx.id;
        try {
          await register(fx.hotkey, (event) => {
            if (event.state === "Pressed") {
              void trigger(id);
            }
          });
        } catch (e) {
          console.warn(`Hotkey ${fx.hotkey} konnte nicht registriert werden:`, e);
        }
      }
    };

    void apply();

    return () => {
      cancelled = true;
      void unregisterAll().catch(() => {});
    };
  }, [effects, trigger]);
}
