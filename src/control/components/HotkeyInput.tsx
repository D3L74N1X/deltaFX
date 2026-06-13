import { useState } from "react";

interface HotkeyInputProps {
  value: string | null;
  onChange: (hotkey: string | null) => void;
}

/** Wandelt ein KeyboardEvent in das Shortcut-Format von Tauri um, z. B. "Control+Shift+F". */
function shortcutFromEvent(e: React.KeyboardEvent): string | null {
  const mods: string[] = [];
  if (e.ctrlKey) mods.push("Control");
  if (e.shiftKey) mods.push("Shift");
  if (e.altKey) mods.push("Alt");
  if (e.metaKey) mods.push("Super");

  const code = e.code;
  let key: string | null = null;
  if (/^Key[A-Z]$/.test(code)) key = code.slice(3);
  else if (/^Digit[0-9]$/.test(code)) key = code.slice(5);
  else if (/^F([1-9]|1[0-9]|2[0-4])$/.test(code)) key = code;
  else if (code === "Space") key = "Space";
  else if (/^Arrow(Up|Down|Left|Right)$/.test(code)) key = code.slice(5);

  if (!key) return null;
  return [...mods, key].join("+");
}

export function HotkeyInput({ value, onChange }: HotkeyInputProps) {
  const [recording, setRecording] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setRecording(true)}
        onBlur={() => setRecording(false)}
        onKeyDown={(e) => {
          if (!recording) return;
          e.preventDefault();
          e.stopPropagation();
          if (e.key === "Escape") {
            setRecording(false);
            return;
          }
          const shortcut = shortcutFromEvent(e);
          if (shortcut) {
            onChange(shortcut);
            setRecording(false);
          }
        }}
        className={`min-w-44 rounded-md border px-3 py-1.5 text-sm ${
          recording
            ? "border-cyan-400 bg-cyan-950 text-cyan-200"
            : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
        }`}
      >
        {recording
          ? "Taste drücken … (Esc bricht ab)"
          : (value ?? "Klicken, um Hotkey zu setzen")}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-sm text-slate-400 hover:text-red-400"
          title="Hotkey entfernen"
        >
          ✕
        </button>
      )}
    </div>
  );
}
