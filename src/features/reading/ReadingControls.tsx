import { ToggleButton } from '../../components/ToggleButton';

type ReadingControlsProps = {
  showLatin: boolean;
  showTranslation: boolean;
  setShowLatin: (value: boolean) => void;
  setShowTranslation: (value: boolean) => void;
};

export function ReadingControls({
  showLatin,
  showTranslation,
  setShowLatin,
  setShowTranslation,
}: ReadingControlsProps) {
  return (
    <div className="reading-controls" role="group" aria-label="Pengaturan tampilan bacaan">
      <ToggleButton checked={showLatin} onChange={setShowLatin}>
        Latin
      </ToggleButton>
      <ToggleButton checked={showTranslation} onChange={setShowTranslation}>
        Arti
      </ToggleButton>
    </div>
  );
}
