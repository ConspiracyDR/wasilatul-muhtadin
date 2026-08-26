type ToggleButtonProps = {
  checked: boolean;
  children: string;
  onChange: (checked: boolean) => void;
};

export function ToggleButton({ checked, children, onChange }: ToggleButtonProps) {
  return (
    <button
      aria-pressed={checked}
      className="toggle-button"
      type="button"
      onClick={() => onChange(!checked)}
    >
      {children}
    </button>
  );
}
