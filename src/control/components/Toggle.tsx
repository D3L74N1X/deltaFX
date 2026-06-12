interface ToggleProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function Toggle({ label, hint, checked, onChange }: ToggleProps) {
  return (
    <label
      className="flex cursor-pointer items-center gap-2 text-sm text-slate-300"
      title={hint}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-cyan-500" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
      {label}
    </label>
  );
}
