import type { ReadingDocument } from '../content/types';
import { sortContent } from '../content/loader';
import fixture from './ratib/example-reading.json';

export async function loadDevelopmentFixtures(
  options: { enabled?: boolean; documents?: ReadingDocument[] } = {},
) {
  const enabled =
    options.enabled ?? (import.meta.env.DEV && import.meta.env.VITE_SHOW_DEV_FIXTURES === 'true');

  if (!enabled) {
    return [];
  }

  return sortContent(options.documents ?? ([fixture] as ReadingDocument[]));
}
