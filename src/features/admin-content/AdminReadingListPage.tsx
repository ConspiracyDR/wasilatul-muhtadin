import { useEffect, useState } from 'react';
import type { DraftReadingSummary } from './admin-content-model';
import { listDraftReadings } from '../../firebase/drafts';
import { useAdminSession } from '../auth/useAdminAuth';

type AdminReadingListPageProps = {
  navigate: (path: string) => void;
};

export function AdminReadingListPage({ navigate }: AdminReadingListPageProps) {
  const session = useAdminSession();
  const [items, setItems] = useState<DraftReadingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session.status !== 'authorized') {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    listDraftReadings()
      .then((drafts) => {
        if (active) {
          setItems(drafts);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError('Gagal memuat daftar draft.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [session.status]);

  if (session.status === 'loading' || session.status === 'checking-admin') {
    return <AdminStatus title="Memeriksa akses admin..." />;
  }

  if (session.status === 'unconfigured') {
    return <AdminGate title="Firebase belum dikonfigurasi" navigate={navigate} />;
  }

  if (session.status === 'signed-out') {
    return <AdminGate title="Login diperlukan" navigate={navigate} />;
  }

  if (session.status === 'unauthorized') {
    return <AdminGate title="Akses admin belum aktif" navigate={navigate} />;
  }

  return (
    <section className="admin-page" aria-labelledby="admin-list-title">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 id="admin-list-title">Daftar Bacaan Draft</h1>
        </div>
        <button className="primary-action compact" type="button" onClick={() => navigate('/admin/bacaan/new')}>
          + Tambah Bacaan
        </button>
      </div>

      {error ? <div className="admin-alert error" role="alert">{error}</div> : null}
      {loading ? <p className="admin-muted">Memuat draft...</p> : null}

      {!loading && items.length === 0 ? (
        <div className="admin-placeholder">
          <strong>Belum ada draft bacaan.</strong>
          <p>Mulai dengan tombol Tambah Bacaan.</p>
        </div>
      ) : null}

      <div className="admin-reading-list">
        {items.map((item) => (
          <article className="admin-reading-row" key={item.id}>
            <div>
              <h2>{item.title || 'Tanpa Judul'}</h2>
              <p>{item.category} · {item.blockCount} block · updated {item.updatedAt ?? '-'}</p>
            </div>
            <button className="back-button" type="button" onClick={() => navigate(`/admin/bacaan/${item.id}`)}>
              Edit
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminStatus({ title }: { title: string }) {
  return (
    <section className="admin-page" role="status">
      <h1>{title}</h1>
    </section>
  );
}

function AdminGate({ title, navigate }: { title: string; navigate: (path: string) => void }) {
  return (
    <section className="admin-page">
      <h1>{title}</h1>
      <p className="admin-muted">Silakan login sebagai admin aktif.</p>
      <button className="primary-action" type="button" onClick={() => navigate('/admin/login')}>
        Ke Login Admin
      </button>
    </section>
  );
}
