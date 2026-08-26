import type { ReadingDocument } from './types';
import { assertValidPublishedContent } from './validate';

const modules = import.meta.glob<ReadingDocument>('./**/*.json', {
  eager: true,
  import: 'default',
});

const allContent = Object.values(modules);

assertValidPublishedContent(allContent);

export function getPublishedContent() {
  return sortContent(allContent);
}

export function findContentBySlug(slug: string) {
  return allContent.find((item) => item.slug === slug) ?? null;
}

export function sortContent(content: ReadingDocument[]) {
  return [...content].sort((a, b) => a.title.localeCompare(b.title, 'id'));
}
