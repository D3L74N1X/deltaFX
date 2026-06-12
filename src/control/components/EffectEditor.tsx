import type { AnimationType, EffectConfig } from "../../types";
import { useControlStore } from "../store";
import { PositionGrid } from "./PositionGrid";
import { HotkeyInput } from "./HotkeyInput";

const ANIMATIONS: { value: AnimationType; label: string }[] = [
  { value: "fade", label: "Einblenden (Fade)" },
  { value: "scale", label: "Skalieren (Scale)" },
  { value: "bounce", label: "Bounce" },
  { value: "slide-up", label: "Von unten einschieben" },
  { value: "slide-down", label: "Von oben einschieben" },
  { value: "slide-left", label: "Von rechts einschieben" },
  { value: "slide-right", label: "Von links einschieben" },
];

const KIND_LABELS: Record<EffectConfig["kind"], string> = {
  image: "Bild",
  video: "Video",
  audio: "Sound",
  model: "3D-Modell",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      {children}
    </div>
  );
}

export function EffectEditor({ effect }: { effect: EffectConfig }) {
  const updateEffect = useControlStore((s) => s.updateEffect);
  const removeEffect = useControlStore((s) => s.removeEffect);
  const trigger = useControlStore((s) => s.trigger);

  const update = (patch: Partial<EffectConfig>) => updateEffect(effect.id, patch);
  const hasVisual = effect.kind !== "audio";
  const hasAudio = effect.kind === "video" || effect.kind === "audio";
  const hasDuration =
    effect.kind === "image" || effect.kind === "model" || effect.loop;

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <input
          value={effect.name}
          onChange={(e) => update({ name: e.target.value })}
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-xl font-bold hover:border-slate-700 focus:border-cyan-500 focus:outline-none"
        />
        <button
          onClick={() => void trigger(effect.id)}
          className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
        >
          ▶ Testen
        </button>
        <button
          onClick={() => void removeEffect(effect.id)}
          className="rounded-md border border-red-900 px-3 py-2 text-sm text-red-400 hover:bg-red-950"
        >
          Löschen
        </button>
      </div>

      <p className="mb-6 text-sm text-slate-500">
        {KIND_LABELS[effect.kind]} · <code>{effect.originalName}</code>
        {effect.kind === "video" && !effect.originalName.endsWith(".webm") && (
          <span className="ml-2 text-amber-400">
            ⚠ Für transparente Videos WebM (VP8/VP9 mit Alpha-Kanal) verwenden –
            MP4 unterstützt keine Transparenz.
          </span>
        )}
      </p>

      <Field label="Hotkey (global, funktioniert auch im Spiel)">
        <HotkeyInput
          value={effect.hotkey}
          onChange={(hotkey) => update({ hotkey })}
        />
      </Field>

      {hasVisual && (
        <>
          <Field label="Position im Overlay">
            <PositionGrid
              value={effect.position}
              customX={effect.customX}
              customY={effect.customY}
              onChange={(patch) => update(patch)}
            />
          </Field>

          <Field label={`Größe: ${effect.size} % der Overlay-Breite`}>
            <input
              type="range"
              min={5}
              max={100}
              value={effect.size}
              onChange={(e) => update({ size: Number(e.target.value) })}
              className="w-full"
            />
          </Field>

          <Field label="Ein-/Ausblend-Animation">
            <select
              value={effect.animation}
              onChange={(e) => update({ animation: e.target.value as AnimationType })}
              className="w-64 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm"
            >
              {ANIMATIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
        </>
      )}

      {(effect.kind === "video" || effect.kind === "audio") && (
        <Field label="Wiedergabe">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={effect.loop}
              onChange={(e) =>
                update({
                  loop: e.target.checked,
                  durationMs: e.target.checked && effect.durationMs === 0 ? 5000 : effect.durationMs,
                })
              }
            />
            In Schleife abspielen (Dauer unten begrenzt die Wiedergabe)
          </label>
        </Field>
      )}

      {hasDuration && (
        <Field label="Anzeigedauer (ms)">
          <input
            type="number"
            min={500}
            step={500}
            value={effect.durationMs}
            onChange={(e) => update({ durationMs: Number(e.target.value) })}
            className="w-32 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm"
          />
        </Field>
      )}

      {hasAudio && (
        <Field label={`Lautstärke: ${Math.round(effect.volume * 100)} %`}>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(effect.volume * 100)}
            onChange={(e) => update({ volume: Number(e.target.value) / 100 })}
            className="w-full"
          />
        </Field>
      )}
    </div>
  );
}
