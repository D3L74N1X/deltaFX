import type { PresetPosition } from "../../types";

const PRESETS: PresetPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "center",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

interface PositionGridProps {
  value: PresetPosition;
  customX: number;
  customY: number;
  onChange: (patch: {
    position?: PresetPosition;
    customX?: number;
    customY?: number;
  }) => void;
}

export function PositionGrid({ value, customX, customY, onChange }: PositionGridProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid grid-cols-3 gap-1 rounded-md border border-slate-700 p-1">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            title={preset}
            onClick={() => onChange({ position: preset })}
            className={`h-8 w-8 rounded ${
              value === preset
                ? "bg-cyan-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          />
        ))}
      </div>
      <div className="text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value === "custom"}
            onChange={(e) =>
              onChange({ position: e.target.checked ? "custom" : "center" })
            }
          />
          Eigene Position (X/Y in %)
        </label>
        {value === "custom" && (
          <div className="mt-2 flex gap-3">
            <label className="flex items-center gap-1 text-slate-400">
              X
              <input
                type="number"
                min={0}
                max={100}
                value={customX}
                onChange={(e) => onChange({ customX: Number(e.target.value) })}
                className="w-16 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200"
              />
            </label>
            <label className="flex items-center gap-1 text-slate-400">
              Y
              <input
                type="number"
                min={0}
                max={100}
                value={customY}
                onChange={(e) => onChange({ customY: Number(e.target.value) })}
                className="w-16 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
