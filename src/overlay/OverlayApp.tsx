import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { listen } from "@tauri-apps/api/event";
import type { TriggerPayload } from "../types";
import {
  EVT_CLEAR_QUEUE,
  EVT_SHOW_GUIDES,
  EVT_TRIGGER_EFFECT,
} from "../lib/events";
import { assetUrl } from "../lib/assets";
import { useQueue } from "./queue";
import { EffectRenderer } from "./EffectRenderer";

/**
 * Das Overlay-Fenster: vollständig transparent, randlos, immer im
 * Vordergrund. In OBS/TikTok Studio als Fensteraufnahme einbinden.
 *
 * Es lauscht auf Trigger-Events vom Control Panel und spielt die
 * Effekte über eine Warteschlange nacheinander ab.
 */
export default function OverlayApp() {
  const current = useQueue((s) => s.current);
  const enqueue = useQueue((s) => s.enqueue);
  const finishCurrent = useQueue((s) => s.finishCurrent);
  const promoteNext = useQueue((s) => s.promoteNext);
  const clear = useQueue((s) => s.clear);
  const [showGuides, setShowGuides] = useState(false);

  useEffect(() => {
    const subs = [
      listen<TriggerPayload>(EVT_TRIGGER_EFFECT, async ({ payload }) => {
        try {
          const url = await assetUrl(payload.effect.fileName);
          enqueue({ effect: payload.effect, url });
        } catch (e) {
          console.error("Asset konnte nicht geladen werden:", e);
        }
      }),
      listen(EVT_CLEAR_QUEUE, () => clear()),
      listen<boolean>(EVT_SHOW_GUIDES, ({ payload }) => setShowGuides(payload)),
    ];
    return () => {
      for (const sub of subs) void sub.then((unlisten) => unlisten());
    };
  }, [enqueue, clear]);

  // Sobald der aktuelle Effekt (inkl. Exit-Animation) fertig ist,
  // rückt der nächste aus der Queue nach.
  useEffect(() => {
    if (current === null) promoteNext();
  }, [current, promoteNext]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {showGuides && (
        <div className="pointer-events-none absolute inset-0 border-4 border-dashed border-cyan-400/70">
          <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded bg-cyan-500/80 px-3 py-1 text-sm font-bold text-black">
            deltaFX Overlay – dieses Fenster in OBS als Fensteraufnahme wählen
          </div>
        </div>
      )}
      <AnimatePresence onExitComplete={promoteNext}>
        {current && (
          <EffectRenderer
            key={current.playId}
            active={current}
            onDone={finishCurrent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
