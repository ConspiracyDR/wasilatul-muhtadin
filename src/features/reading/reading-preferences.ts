import { useEffect, useState } from 'react';
import { readJson, writeJson } from '../../lib/storage';

const storageKey = 'wm.preferences.v1';

export type ReadingPreferences = {
  version: 1;
  showLatin: boolean;
  showTranslation: boolean;
  arabicFontFamily: ArabicFontFamily;
  arabicFontSize: number;
  latinFontSize: number;
  translationFontSize: number;
};

export type ArabicFontFamily = 'Scheherazade New' | 'Amiri' | 'Noto Naskh Arabic';

export const arabicFontFamilyOptions: ArabicFontFamily[] = [
  'Scheherazade New',
  'Amiri',
  'Noto Naskh Arabic',
];

export const defaultReadingPreferences: ReadingPreferences = {
  version: 1,
  showLatin: false,
  showTranslation: false,
  arabicFontFamily: 'Noto Naskh Arabic',
  arabicFontSize: 32,
  latinFontSize: 16,
  translationFontSize: 16,
};

export const readingFontSizeRanges = {
  arabic: { min: 26, max: 44, step: 2, default: 32 },
  latin: { min: 14, max: 22, step: 1, default: 16 },
  translation: { min: 14, max: 22, step: 1, default: 16 },
} as const;

export function loadReadingPreferences(): ReadingPreferences {
  const stored = readJson<Partial<ReadingPreferences>>(storageKey);
  if (
    !stored ||
    stored.version !== 1 ||
    typeof stored.showLatin !== 'boolean' ||
    typeof stored.showTranslation !== 'boolean'
  ) {
    return defaultReadingPreferences;
  }

  return {
    version: 1,
    showLatin: stored.showLatin,
    showTranslation: stored.showTranslation,
    arabicFontFamily: normalizeArabicFontFamily(stored.arabicFontFamily),
    arabicFontSize: normalizeFontSize(
      stored.arabicFontSize,
      readingFontSizeRanges.arabic,
    ),
    latinFontSize: normalizeFontSize(
      stored.latinFontSize,
      readingFontSizeRanges.latin,
    ),
    translationFontSize: normalizeFontSize(
      stored.translationFontSize,
      readingFontSizeRanges.translation,
    ),
  };
}

export function saveReadingPreferences(preferences: ReadingPreferences) {
  writeJson(storageKey, preferences);
}

export function useReadingPreferences() {
  const [preferences, setPreferences] = useState(loadReadingPreferences);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    saveReadingPreferences(preferences);
  }, [preferences]);

  return {
    ...preferences,
    settingsOpen,
    openSettings() {
      setSettingsOpen(true);
    },
    closeSettings() {
      setSettingsOpen(false);
    },
    setShowLatin(showLatin: boolean) {
      setPreferences((current) => ({ ...current, showLatin }));
    },
    setShowTranslation(showTranslation: boolean) {
      setPreferences((current) => ({ ...current, showTranslation }));
    },
    setArabicFontFamily(arabicFontFamily: ArabicFontFamily) {
      setPreferences((current) => ({ ...current, arabicFontFamily }));
    },
    setArabicFontSize(arabicFontSize: number) {
      setPreferences((current) => ({
        ...current,
        arabicFontSize: normalizeFontSize(
          arabicFontSize,
          readingFontSizeRanges.arabic,
        ),
      }));
    },
    setLatinFontSize(latinFontSize: number) {
      setPreferences((current) => ({
        ...current,
        latinFontSize: normalizeFontSize(latinFontSize, readingFontSizeRanges.latin),
      }));
    },
    setTranslationFontSize(translationFontSize: number) {
      setPreferences((current) => ({
        ...current,
        translationFontSize: normalizeFontSize(
          translationFontSize,
          readingFontSizeRanges.translation,
        ),
      }));
    },
  };
}

function normalizeFontSize(
  value: unknown,
  range: { min: number; max: number; default: number },
) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return range.default;
  }

  return Math.min(range.max, Math.max(range.min, Math.round(value)));
}

function normalizeArabicFontFamily(value: unknown): ArabicFontFamily {
  return arabicFontFamilyOptions.includes(value as ArabicFontFamily)
    ? (value as ArabicFontFamily)
    : defaultReadingPreferences.arabicFontFamily;
}
