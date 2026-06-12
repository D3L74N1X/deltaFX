import { useEffect } from "react";
import { useControlStore } from "./store";
import { useGlobalHotkeys } from "./useGlobalHotkeys";
import { EffectList } from "./components/EffectList";
import { EffectEditor } from "./components/EffectEditor";
import { Toggle } from "./components/Toggle";

export default function App() {
  const load = useControlStore((s) => s.load);
  const effects = useControlStore((s) => s.effects);
  const selectedId = useControlStore((s) => s.selectedId);
  const clickThrough = useControlStore((s) => s.clickThrough);
  const showGuides = useControlStore((s) => s.showGuides);
  const setClickThrough = useControlStore((s) => s.setClickThrough);
  const setShowGuides = useControlStore((s) => s.setShowGuides);
  const clearQueue = useControlStore((s) => s.clearQueue);
  const error = useControlStore((s) => s.error);
  const dismissError = useControlStore((s) => s.dismissError);

  useEffect(() => {
    void load();
  }, [load]);

  useGlobalHotkeys();

  const selected = effects.find((fx) => fx.id === selectedId) ?? null;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-6 border-b border-slate-800 bg-slate-900/80 px-5 py-3">
        <h1 className="text-lg font-bold tracking-wide">
          <span className="text-cyan-400">Δ</span>FX
          <span className="ml-2 text-xs font-normal text-slate-400">
            Overlay Control Panel
          </span>
        </h1>
        <div className="ml-auto flex items-center gap-5">
          <Toggle
            label="Click-through"
            hint="Mausklicks gehen durch das Overlay hindurch"
            checked={clickThrough}
            onChange={(v) => void setClickThrough(v)}
          />
          <Toggle
            label="Hilfsrahmen"
            hint="Rahmen im Overlay anzeigen (zum Einrichten in OBS)"
            checked={showGuides}
            onChange={(v) => void setShowGuides(v)}
          />
          <button
            onClick={() => void clearQueue()}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            Queue leeren
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-3 bg-red-950/80 px-5 py-2 text-sm text-red-300">
          <span className="flex-1">{error}</span>
          <button onClick={dismissError} className="text-red-400 hover:text-red-200">
            ✕
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <EffectList />
        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          {selected ? (
            <EffectEditor effect={selected} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
              <span className="text-5xl">Δ</span>
              <p>Importiere Medien, um deinen ersten Effekt zu erstellen.</p>
              <p className="max-w-md text-center text-xs text-slate-600">
                Tipp: Füge in OBS eine <b>Fensteraufnahme</b> hinzu und wähle das
                Fenster „deltaFX – Overlay“. Aktiviere dort „Transparenz zulassen“.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
