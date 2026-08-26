type IconButtonProps = {
  ariaLabel: string;
  children: string;
  onClick: () => void;
};

export function IconButton({ ariaLabel, children, onClick }: IconButtonProps) {
  return (
    <button aria-label={ariaLabel} className="icon-button" type="button" onClick={onClick}>
      {children}
    </button>
  );
}
