export type CategoryId = 'tawasul' | 'ratib' | 'tahlil' | 'doa';

export type ReviewStatus = 'approved' | 'needs_review';

export type ReadingSection = {
  id: string;
  title?: string | null;
  arabic?: string | null;
  latin?: string | null;
  translation?: string | null;
  repeat?: number[] | null;
  note?: string | null;
  review_status: ReviewStatus;
};

export type ReadingDocument = {
  id: string;
  slug: string;
  title: string;
  category: CategoryId;
  description?: string | null;
  sortOrder?: number | null;
  version: number;
  updatedAt?: string | null;
  publishedAt?: string | null;
  source_note: string;
  sections: ReadingSection[];
};

export type CategoryDefinition = {
  id: CategoryId;
  label: string;
  description: string;
};
