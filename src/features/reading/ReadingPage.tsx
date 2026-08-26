import type { CSSProperties } from 'react';
import type { ReadingDocument } from '../../content/types';
import { ReadingSection } from './ReadingSection';
import {
  arabicFontFamilyOptions,
  type ArabicFontFamily,
  readingFontSizeRanges,
  useReadingPreferences,
} from './reading-preferences';

type ReadingPageProps = {
  content: ReadingDocument | null;
  forceShowAllContent?: boolean;
  onBack: () => void;
};

export function ReadingPage({ content, forceShowAllContent = false, onBack }: ReadingPageProps) {
  const preferences = useReadingPreferences();
  const readingStyle = {
    '--reading-arabic-font-family': `"${preferences.arabicFontFamily}", var(--font-arabic)`,
    '--reading-arabic-size': `${preferences.arabicFontSize}px`,
    '--reading-latin-size': `${preferences.latinFontSize}px`,
    '--reading-translation-size': `${preferences.translationFontSize}px`,
  } as CSSProperties;

  if (!content) {
    return (
      <section className="empty-state" aria-labelledby="missing-reading-title">
        <h1 id="missing-reading-title">Bacaan belum tersedia</h1>
        <p>Konten bacaan ini belum tersedia untuk ditampilkan.</p>
        <button className="primary-action" type="button" onClick={onBack}>
          Kembali
        </button>
      </section>
    );
  }

  return (
    <article className="reading-view" style={readingStyle}>
      <header className="reading-mode-header">
        <button
          aria-label="Kembali"
          className="reading-header-button"
          type="button"
          onClick={onBack}
        >
          ←
        </button>
        <h1>{content.title}</h1>
        <button
          aria-label="Buka pengaturan bacaan"
          className="reading-header-button"
          type="button"
          onClick={preferences.openSettings}
        >
          ⚙
        </button>
      </header>

      {content.description ? (
        <p className="reading-description">{content.description}</p>
      ) : null}

      <div className="reading-sections">
        {content.sections.map((section) => (
          <ReadingSection
            key={section.id}
            section={section}
            showLatin={forceShowAllContent || preferences.showLatin}
            showTranslation={forceShowAllContent || preferences.showTranslation}
          />
        ))}
      </div>
      <ReadingSettingsSheet
        arabicFontFamily={preferences.arabicFontFamily}
        arabicFontSize={preferences.arabicFontSize}
        latinFontSize={preferences.latinFontSize}
        open={preferences.settingsOpen}
        setArabicFontFamily={preferences.setArabicFontFamily}
        setArabicFontSize={preferences.setArabicFontSize}
        setLatinFontSize={preferences.setLatinFontSize}
        setShowLatin={preferences.setShowLatin}
        setShowTranslation={preferences.setShowTranslation}
        setTranslationFontSize={preferences.setTranslationFontSize}
        showLatin={preferences.showLatin}
        showTranslation={preferences.showTranslation}
        translationFontSize={preferences.translationFontSize}
        onClose={preferences.closeSettings}
      />
    </article>
  );
}

type ReadingSettingsSheetProps = {
  arabicFontFamily: ArabicFontFamily;
  arabicFontSize: number;
  latinFontSize: number;
  open: boolean;
  setArabicFontFamily: (value: ArabicFontFamily) => void;
  setArabicFontSize: (value: number) => void;
  setLatinFontSize: (value: number) => void;
  setShowLatin: (value: boolean) => void;
  setShowTranslation: (value: boolean) => void;
  setTranslationFontSize: (value: number) => void;
  showLatin: boolean;
  showTranslation: boolean;
  translationFontSize: number;
  onClose: () => void;
};

function ReadingSettingsSheet({
  arabicFontFamily,
  arabicFontSize,
  latinFontSize,
  open,
  setArabicFontFamily,
  setArabicFontSize,
  setLatinFontSize,
  setShowLatin,
  setShowTranslation,
  setTranslationFontSize,
  showLatin,
  showTranslation,
  translationFontSize,
  onClose,
}: ReadingSettingsSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="settings-layer">
      <button
        aria-label="Tutup pengaturan bacaan"
        className="settings-backdrop"
        type="button"
        onClick={onClose}
      />
      <section
        aria-label="Pengaturan bacaan"
        aria-modal="true"
        className="settings-sheet"
        role="dialog"
      >
        <div className="settings-sheet-header">
          <h2>Pengaturan</h2>
          <button
            aria-label="Tutup pengaturan"
            className="reading-header-button"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="settings-group" aria-labelledby="display-settings-title">
          <h3 id="display-settings-title">Tampilan</h3>
          <SettingSwitch
            checked={showLatin}
            label="Latin"
            onChange={setShowLatin}
          />
          <SettingSwitch
            checked={showTranslation}
            label="Arti"
            onChange={setShowTranslation}
          />
        </div>

        <div className="settings-group" aria-labelledby="font-settings-title">
          <h3 id="font-settings-title">Ukuran teks</h3>
          <FontFamilySelect
            value={arabicFontFamily}
            onChange={setArabicFontFamily}
          />
          <FontSizeSlider
            label="Arab"
            range={readingFontSizeRanges.arabic}
            value={arabicFontSize}
            onChange={setArabicFontSize}
          />
          <FontSizeSlider
            label="Latin"
            range={readingFontSizeRanges.latin}
            value={latinFontSize}
            onChange={setLatinFontSize}
          />
          <FontSizeSlider
            label="Arti"
            range={readingFontSizeRanges.translation}
            value={translationFontSize}
            onChange={setTranslationFontSize}
          />
        </div>
      </section>
    </div>
  );
}

function SettingSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      aria-pressed={checked}
      className="settings-switch"
      type="button"
      onClick={() => onChange(!checked)}
    >
      <span>{label}</span>
      <span aria-hidden="true">{checked ? 'ON' : 'OFF'}</span>
    </button>
  );
}

function FontFamilySelect({
  value,
  onChange,
}: {
  value: ArabicFontFamily;
  onChange: (value: ArabicFontFamily) => void;
}) {
  return (
    <label className="font-select">
      <span>Font Arab QA</span>
      <select
        aria-label="Font Arab QA"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value as ArabicFontFamily)}
      >
        {arabicFontFamilyOptions.map((fontFamily) => (
          <option key={fontFamily} value={fontFamily}>
            {fontFamily}
          </option>
        ))}
      </select>
    </label>
  );
}

function FontSizeSlider({
  label,
  range,
  value,
  onChange,
}: {
  label: string;
  range: { min: number; max: number; step: number };
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="font-slider">
      <span>
        <span>{label}</span>
        <strong>{value}px</strong>
      </span>
      <input
        aria-label={`Ukuran teks ${label}`}
        max={range.max}
        min={range.min}
        step={range.step}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}
