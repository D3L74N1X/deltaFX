import type { AssetKind } from "../../types";
import { useControlStore } from "../store";

const KIND_ICONS: Record<AssetKind, string> = {
  image: "🖼️",
  video: "🎬",
  audio: "🔊",
  model: "🧊",
};

export function EffectList() {
  const effects = useControlStore((s) => s.effects);
  const selectedId = useControlStore((s) => s.selectedId);
  const select = useControlStore((s) => s.select);
  const importAssets = useControlStore((s) => s.importAssets);
  const trigger = useControlStore((s) => s.trigger);

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-900/40">
      <div className="p-3">
        <button
          onClick={() => void importAssets()}
          className="w-full rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
        >
          + Medien importieren
        </button>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {effects.map((fx) => (
          <li key={fx.id}>
            <div
              onClick={() => select(fx.id)}
              className={`group mb-1 flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm ${
                fx.id === selectedId
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              <span>{KIND_ICONS[fx.kind]}</span>
              <span className="min-w-0 flex-1 truncate">{fx.name}</span>
              {fx.hotkey && (
                <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300">
                  {fx.hotkey}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  void trigger(fx.id);
                }}
                title="Effekt abspielen"
                className="rounded px-1 text-cyan-400 opacity-0 transition-opacity hover:text-cyan-200 group-hover:opacity-100"
              >
                ▶
              </button>
            </div>
          </li>
        ))}
        {effects.length === 0 && (
          <li className="px-2 py-4 text-center text-xs text-slate-500">
            Noch keine Effekte
          </li>
        )}
      </ul>
    </aside>
  );
}
