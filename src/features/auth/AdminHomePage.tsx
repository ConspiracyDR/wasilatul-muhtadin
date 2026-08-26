import { signOutAdmin } from '../../firebase/auth';
import { useAdminSession } from './useAdminAuth';

type AdminHomePageProps = {
  navigate: (path: string) => void;
};

export function AdminHomePage({ navigate }: AdminHomePageProps) {
  const session = useAdminSession();

  if (session.status === 'loading' || session.status === 'checking-admin') {
    return (
      <section className="admin-auth-view" role="status">
        <h1>Memeriksa akses admin...</h1>
      </section>
    );
  }

  if (session.status === 'unconfigured') {
    return (
      <AdminGateMessage
        title="Firebase belum dikonfigurasi"
        message="Isi `.env.local` dari `.env.example` sebelum membuka area admin."
        navigate={navigate}
      />
    );
  }

  if (session.status === 'signed-out') {
    return (
      <AdminGateMessage
        title="Login diperlukan"
        message="Silakan login sebagai admin untuk membuka area ini."
        navigate={navigate}
      />
    );
  }

  if (session.status === 'unauthorized') {
    return (
      <AdminGateMessage
        title="Akses admin belum aktif"
        message="Akun ini belum memiliki izin untuk mengakses halaman admin."
        navigate={navigate}
      />
    );
  }

  return (
    <section className="admin-auth-view" aria-labelledby="admin-home-title">
      <p className="eyebrow">Admin</p>
      <h1 id="admin-home-title">Admin Content Manager</h1>
      <div className="admin-placeholder">
        <strong>Editor bacaan aktif</strong>
        <p>
          Kelola draft bacaan, preview tampilan jamaah, lalu publish saat konten
          sudah siap.
        </p>
      </div>
      <button
        className="back-button"
        type="button"
        onClick={() => {
          signOutAdmin().finally(() => navigate('/admin/login'));
        }}
      >
        Keluar
      </button>
    </section>
  );
}

function AdminGateMessage({
  title,
  message,
  navigate,
}: {
  title: string;
  message: string;
  navigate: (path: string) => void;
}) {
  return (
    <section className="admin-auth-view" aria-labelledby="admin-gate-title">
      <h1 id="admin-gate-title">{title}</h1>
      <p className="admin-muted">{message}</p>
      <button className="primary-action" type="button" onClick={() => navigate('/admin/login')}>
        Ke Login Admin
      </button>
    </section>
  );
}
