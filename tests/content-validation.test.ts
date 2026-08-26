import { describe, expect, it } from 'vitest';
import { validateReadingDocument, validateReadingDocuments } from '../src/content/validate';

const approvedDocument = {
  id: 'demo-approved',
  slug: 'demo-approved',
  title: 'Demo Approved',
  category: 'doa',
  version: 1,
  source_note: 'Non-production test fixture.',
  sections: [
    {
      id: 'section-001',
      arabic: 'placeholder',
      repeat: [3],
      review_status: 'approved',
    },
  ],
};

describe('content validation', () => {
  it('accepts approved structured content', () => {
    expect(validateReadingDocument(approvedDocument, { requireApproved: true }).ok).toBe(
      true,
    );
  });

  it('blocks needs_review content for production validation', () => {
    const result = validateReadingDocument(
      {
        ...approvedDocument,
        sections: [{ id: 'section-001', arabic: 'placeholder', review_status: 'needs_review' }],
      },
      { requireApproved: true },
    );

    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toContain('must be approved for production');
  });

  it('detects duplicate ids and slugs', () => {
    const result = validateReadingDocuments([approvedDocument, approvedDocument]);

    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toContain('duplicate id');
    expect(result.errors.join('\n')).toContain('duplicate slug');
  });
});
