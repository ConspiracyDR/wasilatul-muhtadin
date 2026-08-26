import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

let testEnv: RulesTestEnvironment;

const projectId = 'demo-wasilatul-muhtadin-rules';
const adminUid = 'admin-user';
const nonAdminUid = 'regular-user';

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync('firebase/firestore.rules', 'utf8'),
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await db.doc('admins/admin-user').set({ active: true });
    await db.doc('admins/inactive-admin').set({ active: false });
    await db.doc('readings/published-ratib').set({
      title: 'Published Ratib',
      category: 'ratib',
    });
    await db.doc('readings/published-ratib/blocks/block-001').set({
      arabic: 'published',
      order: 1,
    });
    await db.doc('readingDrafts/draft-ratib').set({
      title: 'Draft Ratib',
      category: 'ratib',
    });
    await db.doc('readingDrafts/draft-ratib/blocks/block-001').set({
      arabic: 'draft',
      order: 1,
    });
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

describe('firestore security rules', () => {
  it('allows public read of published reading and block', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(db.doc('readings/published-ratib').get());
    await assertSucceeds(db.doc('readings/published-ratib/blocks/block-001').get());
  });

  it('denies public write to published reading', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(db.doc('readings/public-write').set({ title: 'Nope' }));
  });

  it('denies public draft read and write', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(db.doc('readingDrafts/draft-ratib').get());
    await assertFails(db.doc('readingDrafts/public-write').set({ title: 'Nope' }));
  });

  it('denies authenticated non-admin draft read and write', async () => {
    const db = testEnv.authenticatedContext(nonAdminUid).firestore();

    await assertFails(db.doc('readingDrafts/draft-ratib').get());
    await assertFails(db.doc('readingDrafts/non-admin-write').set({ title: 'Nope' }));
  });

  it('allows authorized admin draft read and write', async () => {
    const db = testEnv.authenticatedContext(adminUid).firestore();

    await assertSucceeds(db.doc('readingDrafts/draft-ratib').get());
    await assertSucceeds(db.doc('readingDrafts/admin-write').set({ title: 'Draft' }));
    await assertSucceeds(
      db.doc('readingDrafts/admin-write/blocks/block-001').set({
        arabic: 'draft',
        order: 1,
      }),
    );
  });

  it('allows authorized admin write to published content foundation paths', async () => {
    const db = testEnv.authenticatedContext(adminUid).firestore();

    await assertSucceeds(db.doc('readings/admin-publish').set({ title: 'Published' }));
    await assertSucceeds(
      db.doc('readings/admin-publish/blocks/block-001').set({
        arabic: 'published',
        order: 1,
      }),
    );
  });

  it('allows user to read only their own admin record', async () => {
    const adminDb = testEnv.authenticatedContext(adminUid).firestore();
    const nonAdminDb = testEnv.authenticatedContext(nonAdminUid).firestore();

    await assertSucceeds(adminDb.doc(`admins/${adminUid}`).get());
    await assertFails(nonAdminDb.doc(`admins/${adminUid}`).get());
    await assertFails(testEnv.unauthenticatedContext().firestore().doc(`admins/${adminUid}`).get());
  });

  it('denies client create or update of own admin record', async () => {
    const db = testEnv.authenticatedContext(nonAdminUid).firestore();
    const adminDb = testEnv.authenticatedContext(adminUid).firestore();

    await assertFails(db.doc(`admins/${nonAdminUid}`).set({ active: true }));
    await assertFails(adminDb.doc(`admins/${adminUid}`).update({ active: false }));
  });

  it('denies listing admin collection', async () => {
    const db = testEnv.authenticatedContext(adminUid).firestore();

    await expect(assertFails(db.collection('admins').get())).resolves.toBeDefined();
  });
});
