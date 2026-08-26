import { beforeEach, describe, expect, it } from 'vitest';
import {
  defaultReadingPreferences,
  loadReadingPreferences,
  readingFontSizeRanges,
  saveReadingPreferences,
} from '../src/features/reading/reading-preferences';

describe('reading preferences', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults Latin and translation to hidden', () => {
    expect(loadReadingPreferences()).toEqual(defaultReadingPreferences);
  });

  it('persists preferences in localStorage', () => {
    saveReadingPreferences({
      version: 1,
      showLatin: true,
      showTranslation: true,
      arabicFontFamily: 'Amiri',
      arabicFontSize: 38,
      latinFontSize: 18,
      translationFontSize: 17,
    });

    expect(loadReadingPreferences()).toEqual({
      version: 1,
      showLatin: true,
      showTranslation: true,
      arabicFontFamily: 'Amiri',
      arabicFontSize: 38,
      latinFontSize: 18,
      translationFontSize: 17,
    });
  });

  it('falls back to default font sizes when stored font data is missing', () => {
    window.localStorage.setItem(
      'wm.preferences.v1',
      JSON.stringify({ version: 1, showLatin: true, showTranslation: false }),
    );

    expect(loadReadingPreferences()).toEqual({
      version: 1,
      showLatin: true,
      showTranslation: false,
      arabicFontFamily: defaultReadingPreferences.arabicFontFamily,
      arabicFontSize: readingFontSizeRanges.arabic.default,
      latinFontSize: readingFontSizeRanges.latin.default,
      translationFontSize: readingFontSizeRanges.translation.default,
    });
  });

  it('persists the Arabic QA font selection', () => {
    saveReadingPreferences({
      ...defaultReadingPreferences,
      arabicFontFamily: 'Scheherazade New',
    });

    expect(loadReadingPreferences().arabicFontFamily).toBe('Scheherazade New');
  });

  it('falls back to default Arabic font when stored value is unknown', () => {
    window.localStorage.setItem(
      'wm.preferences.v1',
      JSON.stringify({
        ...defaultReadingPreferences,
        arabicFontFamily: 'Unknown Font',
      }),
    );

    expect(loadReadingPreferences().arabicFontFamily).toBe(
      defaultReadingPreferences.arabicFontFamily,
    );
  });

  it('falls back safely when stored data is corrupt', () => {
    window.localStorage.setItem('wm.preferences.v1', '{bad-json');

    expect(loadReadingPreferences()).toEqual(defaultReadingPreferences);
  });
});
