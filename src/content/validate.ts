import type { CategoryId, ReadingDocument, ReviewStatus } from './types';

const categoryIds: CategoryId[] = ['tawasul', 'ratib', 'tahlil', 'doa'];
const reviewStatuses: ReviewStatus[] = ['approved', 'needs_review'];

export type ValidationOptions = {
  requireApproved?: boolean;
};

export type ValidationResult = {
  ok: boolean;
  errors: string[];
};

export function validateReadingDocuments(
  documents: unknown[],
  options: ValidationOptions = {},
): ValidationResult {
  const errors: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();

  documents.forEach((document, index) => {
    const result = validateReadingDocument(document, options);
    errors.push(...result.errors.map((error) => `document ${index + 1}: ${error}`));

    if (isObject(document)) {
      const id = typeof document.id === 'string' ? document.id : null;
      const slug = typeof document.slug === 'string' ? document.slug : null;

      if (id) {
        if (ids.has(id)) errors.push(`duplicate id "${id}"`);
        ids.add(id);
      }
      if (slug) {
        if (slugs.has(slug)) errors.push(`duplicate slug "${slug}"`);
        slugs.add(slug);
      }
    }
  });

  return { ok: errors.length === 0, errors };
}

export function validateReadingDocument(
  document: unknown,
  options: ValidationOptions = {},
): ValidationResult {
  const errors: string[] = [];

  if (!isObject(document)) {
    return { ok: false, errors: ['content must be an object'] };
  }

  requireKebabString(document.id, 'id', errors);
  requireKebabString(document.slug, 'slug', errors);
  requireNonEmptyString(document.title, 'title', errors);
  requireNonEmptyString(document.source_note, 'source_note', errors);

  if (!categoryIds.includes(document.category as CategoryId)) {
    errors.push('category must be one of tawasul, ratib, tahlil, doa');
  }

  if (!Number.isInteger(document.version) || Number(document.version) < 1) {
    errors.push('version must be a positive integer');
  }

  if (!Array.isArray(document.sections) || document.sections.length === 0) {
    errors.push('sections must not be empty');
  } else {
    document.sections.forEach((section, index) => {
      errors.push(...validateSection(section, index, options));
    });
  }

  return { ok: errors.length === 0, errors };
}

export function assertValidPublishedContent(documents: ReadingDocument[]) {
  const result = validateReadingDocuments(documents, { requireApproved: true });
  if (!result.ok) {
    throw new Error(result.errors.join('\n'));
  }
}

function validateSection(
  section: unknown,
  index: number,
  options: ValidationOptions,
): string[] {
  const prefix = `section ${index + 1}`;
  const errors: string[] = [];

  if (!isObject(section)) {
    return [`${prefix}: section must be an object`];
  }

  requireKebabString(section.id, `${prefix}.id`, errors);

  const hasArabic =
    typeof section.arabic === 'string' && section.arabic.trim().length > 0;
  if (!hasArabic) {
    errors.push(`${prefix}.arabic must be non-empty for V1 reading content`);
  }

  if (
    section.repeat !== undefined &&
    section.repeat !== null &&
    (!Array.isArray(section.repeat) ||
      section.repeat.length === 0 ||
      section.repeat.some((value) => !Number.isInteger(value) || Number(value) < 1))
  ) {
    errors.push(`${prefix}.repeat must be an array of positive integers when provided`);
  }

  if (!reviewStatuses.includes(section.review_status as ReviewStatus)) {
    errors.push(`${prefix}.review_status must be approved or needs_review`);
  }

  if (options.requireApproved && section.review_status !== 'approved') {
    errors.push(`${prefix}.review_status must be approved for production`);
  }

  return errors;
}

function requireNonEmptyString(value: unknown, field: string, errors: string[]) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${field} must be a non-empty string`);
  }
}

function requireKebabString(value: unknown, field: string, errors: string[]) {
  if (typeof value !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    errors.push(`${field} must be kebab-case`);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
