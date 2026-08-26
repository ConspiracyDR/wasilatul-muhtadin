import { type FormEvent, useEffect, useState } from 'react';
import { signInAdmin } from '../../firebase/auth';
import { useAdminSession } from './useAdminAuth';

type AdminLoginPageProps = {
  navigate: (path: string) => void;
};

export function AdminLoginPage({ navigate }: AdminLoginPageProps) {
  const session = useAdminSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session.status === 'authorized') {
      navigate('/admin');
    }
  }, [navigate, session.status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signInAdmin(email, password);
      navigate('/admin');
    } catch {
      setError('Login gagal. Periksa email/password dan konfigurasi Firebase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-auth-view" aria-labelledby="admin-login-title">
      <p className="eyebrow">Admin</p>
      <h1 id="admin-login-title">Login Admin</h1>
      <p className="admin-muted">
        Area ini khusus pengelola. Jamaah tidak perlu login untuk membaca bacaan.
      </p>

      {session.status === 'unconfigured' ? (
        <div className="admin-alert" role="status">
          Firebase belum dikonfigurasi. Isi `.env.local` dari `.env.example`.
        </div>
      ) : null}

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            inputMode="email"
            required
            type="email"
            value={email}
            onChange={(event) => {
              setError(null);
              setEmail(event.currentTarget.value);
            }}
          />
        </label>
        <label>
          <span>Password</span>
          <input
            autoComplete="current-password"
            required
            type="password"
            value={password}
            onChange={(event) => {
              setError(null);
              setPassword(event.currentTarget.value);
            }}
          />
        </label>

        {error ? (
          <div className="admin-alert error" role="alert">
            {error}
          </div>
        ) : null}

        <button
          className="primary-action"
          disabled={submitting || session.status === 'unconfigured'}
          type="submit"
        >
          {submitting ? 'Masuk...' : 'Masuk'}
        </button>
      </form>
    </section>
  );
}
