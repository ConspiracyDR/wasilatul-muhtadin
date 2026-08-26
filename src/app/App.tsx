import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { appConfig } from '../config/app-config';
import { categories } from '../content/registry';
import {
  filterPublishedReadingsByCategory,
  getPublishedReadingBySlug,
  listPublishedReadingSummaries,
  PublicContentUnavailableError,
  sortPublishedReadings,
} from '../firebase/public-readings';
import type { CategoryId, ReadingDocument } from '../content/types';
import { ReadingPage } from '../features/reading/ReadingPage';
import { PwaInstallButton } from './PwaInstallButton';
import { PwaUpdateNotice } from './PwaUpdateNotice';
import { useHashlessRouter } from './routes';

const AdminLoginPage = lazy(() =>
  import('../features/auth/AdminLoginPage').then((module) => ({
    default: module.AdminLoginPage,
  })),
);

const AdminReadingListPage = lazy(() =>
  import('../features/admin-content/AdminReadingListPage').then((module) => ({
    default: module.AdminReadingListPage,
  })),
);

const AdminReadingEditorPage = lazy(() =>
  import('../features/admin-content/AdminReadingEditorPage').then((module) => ({
    default: module.AdminReadingEditorPage,
  })),
);

export function App() {
  const { path, navigate } = useHashlessRouter();
  const route = resolveRoute(path);
  const [publicContentState, setPublicContentState] = useState<PublicContentState>({
    status: 'loading',
    content: [],
  });
  const [developmentContent, setDevelopmentContent] = useState<ReadingDocument[]>([]);
  const content = useMemo(() => {
    if (publicContentState.status === 'ready') {
      return publicContentState.content;
    }
    return sortPublishedReadings(developmentContent);
  }, [developmentContent, publicContentState]);

  useEffect(() => {
    let active = true;
    setPublicContentState((current) => ({ ...current, status: 'loading' }));

    listPublishedReadingSummaries()
      .then((readings) => {
        if (!active) return;
        setPublicContentState(
          readings
            ? { status: 'ready', content: readings }
            : { status: 'unavailable', content: [] },
        );
      })
      .catch((error) => {
        if (!active) return;
        setPublicContentState({
          status:
            error instanceof PublicContentUnavailableError
              ? 'unavailable'
              : navigator.onLine === false
                ? 'offline-empty'
                : 'error',
          content: [],
        });
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV || import.meta.env.VITE_SHOW_DEV_FIXTURES !== 'true') {
      return;
    }

    let active = true;
    import('../dev-content/load-development-fixtures').then(
      ({ loadDevelopmentFixtures }) => {
        loadDevelopmentFixtures().then((fixtures) => {
          if (active) {
            setDevelopmentContent(fixtures);
          }
        });
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={route.name === 'reading' ? 'app-shell reading-mode-shell' : 'app-shell'}>
      {route.name === 'reading' ? null : <AppHeader onHome={() => navigate('/')} />}
      <PwaUpdateNotice />
      <main className="app-main">
        {route.name === 'home' ? (
          <HomePage content={content} status={publicContentState.status} navigate={navigate} />
        ) : null}
        {route.name === 'category' ? (
          <CategoryPage
            categoryId={route.categoryId}
            content={content}
            status={publicContentState.status}
            navigate={navigate}
          />
        ) : null}
        {route.name === 'reading' ? (
          <PublicReadingRoute
            fallbackContent={content.find((item) => item.slug === route.slug) ?? null}
            slug={route.slug}
            onBack={() => navigate('/')}
          />
        ) : null}
        {route.name === 'admin-login' ? (
          <Suspense fallback={<AdminLoadingState />}>
            <AdminLoginPage navigate={navigate} />
          </Suspense>
        ) : null}
        {route.name === 'admin' ? (
          <Suspense fallback={<AdminLoadingState />}>
            <AdminReadingListPage navigate={navigate} />
          </Suspense>
        ) : null}
        {route.name === 'admin-reading' ? (
          <Suspense fallback={<AdminLoadingState />}>
            <AdminReadingEditorPage readingId={route.readingId} navigate={navigate} />
          </Suspense>
        ) : null}
        {route.name === 'not-found' ? <NotFoundPage navigate={navigate} /> : null}
      </main>
    </div>
  );
}

type PublicContentStatus = 'loading' | 'ready' | 'unavailable' | 'error' | 'offline-empty';

type PublicContentState = {
  status: PublicContentStatus;
  content: ReadingDocument[];
};

function AdminLoadingState() {
  return (
    <section className="admin-auth-view" role="status">
      <h1>Memuat area admin...</h1>
    </section>
  );
}

type Route =
  | { name: 'home' }
  | { name: 'category'; categoryId: CategoryId }
  | { name: 'reading'; slug: string }
  | { name: 'admin-login' }
  | { name: 'admin' }
  | { name: 'admin-reading'; readingId: string }
  | { name: 'not-found' };

function resolveRoute(path: string): Route {
  if (path === '/' || path === '') {
    return { name: 'home' };
  }

  if (path === '/admin/login') {
    return { name: 'admin-login' };
  }

  if (path === '/admin') {
    return { name: 'admin' };
  }

  const adminReadingMatch = path.match(/^\/admin\/bacaan\/([^/]+)$/);
  if (adminReadingMatch?.[1]) {
    return { name: 'admin-reading', readingId: decodeURIComponent(adminReadingMatch[1]) };
  }

  const readingMatch = path.match(/^\/bacaan\/([^/]+)$/);
  if (readingMatch?.[1]) {
    return { name: 'reading', slug: decodeURIComponent(readingMatch[1]) };
  }

  const categoryMatch = path.match(/^\/kategori\/([^/]+)$/);
  if (categoryMatch?.[1] && isCategoryId(categoryMatch[1])) {
    return { name: 'category', categoryId: categoryMatch[1] };
  }

  return { name: 'not-found' };
}

function HomePage({
  content,
  status,
  navigate,
}: {
  content: ReadingDocument[];
  status: PublicContentStatus;
  navigate: (path: string) => void;
}) {
  return (
    <section className="home-view" aria-labelledby="home-title">
      <div className="home-intro">
        <img className="home-logo" alt="" src={appConfig.logoPath} />
        <div>
          <p className="eyebrow">{appConfig.majelisName}</p>
          <h1 id="home-title">{appConfig.appName}</h1>
          <p>{appConfig.description}</p>
          <div className="home-actions">
            <PwaInstallButton />
          </div>
        </div>
      </div>

      <div className="section-block" aria-labelledby="category-title">
        <h2 id="category-title">Pilih Bacaan</h2>
        <div className="category-list">
          {categories.map((category) => {
            const items = content.filter((item) => item.category === category.id);
            return (
              <button
                className="category-row"
                key={category.id}
                type="button"
                onClick={() => navigate(`/kategori/${category.id}`)}
              >
                <div>
                  <h3>{category.label}</h3>
                  <p>{category.description}</p>
                </div>
                <span className={items.length > 0 ? 'count-pill ready' : 'count-pill'}>
                  {items.length > 0 ? items.length : 'Belum'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {content.length > 0 ? (
        <div className="reading-list" aria-label="Daftar bacaan tersedia">
          {content.map((item) => (
            <button
              className="reading-link"
              key={item.id}
              type="button"
              onClick={() => navigate(`/bacaan/${item.slug}`)}
            >
              <span>{item.title}</span>
              <span>{getCategoryLabel(item.category)}</span>
            </button>
          ))}
        </div>
      ) : (
        <PublicContentStateMessage status={status} />
      )}
    </section>
  );
}

function CategoryPage({
  categoryId,
  content,
  status,
  navigate,
}: {
  categoryId: CategoryId;
  content: ReadingDocument[];
  status: PublicContentStatus;
  navigate: (path: string) => void;
}) {
  const category = categories.find((item) => item.id === categoryId);
  const items = filterPublishedReadingsByCategory(content, categoryId);

  if (!category) {
    return <NotFoundPage navigate={navigate} />;
  }

  return (
    <section className="category-view" aria-labelledby="category-page-title">
      <button className="back-button" type="button" onClick={() => navigate('/')}>
        Kembali
      </button>
      <div className="category-heading">
        <p className="eyebrow">{appConfig.shortName}</p>
        <h1 id="category-page-title">{category.label}</h1>
        <p>{category.description}</p>
      </div>

      {items.length > 0 ? (
        <div className="reading-list" aria-label={`Daftar bacaan ${category.label}`}>
          {items.map((item) => (
            <button
              className="reading-link"
              key={item.id}
              type="button"
              onClick={() => navigate(`/bacaan/${item.slug}`)}
            >
              <span>{item.title}</span>
              <span>Buka</span>
            </button>
          ))}
        </div>
      ) : (
        <PublicContentStateMessage categoryLabel={category.label} status={status} />
      )}
    </section>
  );
}

function PublicReadingRoute({
  fallbackContent,
  slug,
  onBack,
}: {
  fallbackContent: ReadingDocument | null;
  slug: string;
  onBack: () => void;
}) {
  const [state, setState] = useState<{
    status: PublicContentStatus | 'not-found';
    content: ReadingDocument | null;
  }>({
    status: fallbackContent?.sections.length ? 'ready' : 'loading',
    content: fallbackContent?.sections.length ? fallbackContent : null,
  });

  useEffect(() => {
    let active = true;
    setState({
      status: fallbackContent?.sections.length ? 'ready' : 'loading',
      content: fallbackContent?.sections.length ? fallbackContent : null,
    });

    getPublishedReadingBySlug(slug)
      .then((reading) => {
        if (!active) return;
        if (reading) {
          setState({ status: 'ready', content: reading });
          return;
        }
        setState(
          fallbackContent?.sections.length
            ? { status: 'ready', content: fallbackContent }
            : { status: 'not-found', content: null },
        );
      })
      .catch((error) => {
        if (!active) return;
        if (fallbackContent?.sections.length) {
          setState({ status: 'ready', content: fallbackContent });
          return;
        }
        setState({
          status:
            error instanceof PublicContentUnavailableError
              ? 'unavailable'
              : navigator.onLine === false
                ? 'offline-empty'
                : 'error',
          content: null,
        });
      });

    return () => {
      active = false;
    };
  }, [fallbackContent, slug]);

  if (state.status === 'ready') {
    return <ReadingPage content={state.content} onBack={onBack} />;
  }

  return (
    <PublicContentStateMessage
      status={state.status === 'not-found' ? 'ready' : state.status}
      title={state.status === 'not-found' ? 'Bacaan tidak ditemukan' : undefined}
      onBack={onBack}
    />
  );
}

function PublicContentStateMessage({
  categoryLabel,
  status,
  title,
  onBack,
}: {
  categoryLabel?: string;
  status: PublicContentStatus;
  title?: string;
  onBack?: () => void;
}) {
  const copy = getPublicStateCopy(status, categoryLabel, title);

  return (
    <section className="empty-state" role="status">
      <h2>{copy.title}</h2>
      <p>{copy.body}</p>
      {onBack ? (
        <button className="primary-action" type="button" onClick={onBack}>
          Kembali
        </button>
      ) : null}
    </section>
  );
}

function getPublicStateCopy(
  status: PublicContentStatus,
  categoryLabel?: string,
  title?: string,
) {
  if (title) {
    return {
      title,
      body: 'Bacaan ini belum tersedia.',
    };
  }

  if (status === 'loading') {
    return {
      title: 'Memuat bacaan...',
      body: 'Aplikasi sedang mengambil daftar bacaan.',
    };
  }

  if (status === 'offline-empty') {
    return {
      title: 'Butuh koneksi untuk memuat pertama kali',
      body: 'Bacaan yang pernah dibuka akan tetap tersedia di perangkat.',
    };
  }

  if (status === 'unavailable') {
    return {
      title: 'Konten belum tersedia',
      body: 'Daftar bacaan belum tersedia.',
    };
  }

  if (status === 'error') {
    return {
      title: 'Konten belum bisa dimuat',
      body: 'Coba buka kembali saat koneksi stabil.',
    };
  }

  return {
    title: categoryLabel ? `Bacaan ${categoryLabel} belum tersedia.` : 'Bacaan belum tersedia.',
    body: 'Konten kategori ini akan muncul setelah tersedia.',
  };
}

function getCategoryLabel(categoryId: CategoryId) {
  return categories.find((category) => category.id === categoryId)?.label ?? 'Bacaan';
}

function NotFoundPage({ navigate }: { navigate: (path: string) => void }) {
  return (
    <section className="empty-state" aria-labelledby="not-found-title">
      <h1 id="not-found-title">Halaman tidak ditemukan</h1>
      <p>Periksa kembali tautan bacaan atau kembali ke halaman utama.</p>
      <button className="primary-action" type="button" onClick={() => navigate('/')}>
        Kembali
      </button>
    </section>
  );
}

function isCategoryId(value: string): value is CategoryId {
  return categories.some((category) => category.id === value);
}
