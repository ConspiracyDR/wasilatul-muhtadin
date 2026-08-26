import type { ReadingSection as ReadingSectionType } from '../../content/types';

type ReadingSectionProps = {
  section: ReadingSectionType;
  showLatin: boolean;
  showTranslation: boolean;
};

export function ReadingSection({
  section,
  showLatin,
  showTranslation,
}: ReadingSectionProps) {
  return (
    <section className="reading-section">
      {section.title ? <h2>{section.title}</h2> : null}
      {section.repeat && section.repeat.length > 0 ? (
        <span className="repeat-badge" aria-label={`Dibaca ${section.repeat.join(' atau ')} kali`}>
          {section.repeat.map((value) => `×${value}`).join(' / ')}
        </span>
      ) : null}
      <p className="arabic-text" dir="rtl" lang="ar">
        {normalizeArabicForPresentation(section.arabic)}
      </p>
      {showLatin && section.latin ? <p className="latin-text">{section.latin}</p> : null}
      {showTranslation && section.translation ? (
        <p className="translation-text">{section.translation}</p>
      ) : null}
      {section.note ? <p className="section-note">{section.note}</p> : null}
    </section>
  );
}

export function normalizeArabicForPresentation(value: string | null | undefined) {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}
