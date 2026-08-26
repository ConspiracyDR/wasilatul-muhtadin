import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminHomePage } from '../src/features/auth/AdminHomePage';

vi.mock('../src/features/auth/useAdminAuth', () => ({
  useAdminSession: () => ({
    status: 'unauthorized',
    user: { uid: 'admin-test-user' },
    authorization: { status: 'unauthorized', active: false },
  }),
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
  }
  container?.remove();
  root = null;
  container = null;
});

function renderAdminHome() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root?.render(<AdminHomePage navigate={vi.fn()} />));
  return container;
}

describe('admin wording cleanup', () => {
  it('does not expose collection names or UID terminology for unauthorized admins', () => {
    const node = renderAdminHome();

    expect(node.textContent).toContain(
      'Akun ini belum memiliki izin untuk mengakses halaman admin.',
    );
    expect(node.textContent).not.toMatch(/admins\/\{uid\}|uid|collection|Firestore|Phase|debug|fixture/i);
  });
});
