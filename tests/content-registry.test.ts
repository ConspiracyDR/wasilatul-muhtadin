import { describe, expect, it } from 'vitest';
import { categories } from '../src/content/registry';
import { validateReadingDocuments } from '../src/content/validate';
import { loadDevelopmentFixtures } from '../src/dev-content/load-development-fixtures';
import fixture from '../src/dev-content/ratib/example-reading.json';

describe('content registry', () => {
  it('contains the required V1 categories', () => {
    expect(categories.map((category) => category.id)).toEqual([
      'tawasul',
      'ratib',
      'tahlil',
      'doa',
    ]);
  });

  it('loads development fixtures outside the production content folder', async () => {
    const fixtures = await loadDevelopmentFixtures({
      enabled: true,
      documents: [fixture as never],
    });

    expect(fixtures).toHaveLength(1);
    expect(fixtures[0]?.slug).toBe('example-reading');
    expect(fixtures[0]?.sections[0]?.review_status).toBe('needs_review');
  });

  it('confirms development fixtures cannot pass production validation', async () => {
    const fixtures = await loadDevelopmentFixtures({
      enabled: true,
      documents: [fixture as never],
    });
    const result = validateReadingDocuments(fixtures, { requireApproved: true });

    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toContain('must be approved for production');
  });

  it('keeps development fixtures hidden by default', async () => {
    await expect(loadDevelopmentFixtures()).resolves.toEqual([]);
  });
});
