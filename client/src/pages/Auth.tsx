import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, API } from '../api';

type FormState = {
  email: string;
  password: string;
  name: string;
  username: string;
};

const initialForm: FormState = { email: '', password: '', name: '', username: '' };

function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'oauth') {
      setErr('GitHub login was cancelled or failed to authenticate.');
    } else if (errorParam === 'db_unreachable') {
      setErr('Database unreachable: Please make sure your PostgreSQL DATABASE_URL is configured in server/.env.');
    } else if (errorParam === 'github_unconfigured') {
      setErr('GitHub OAuth is not configured. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to server/.env.');
    }
  }, [searchParams]);

  const updateField = (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setErr('');

    try {
      const payload = mode === 'register'
        ? form
        : { email: form.email, password: form.password };

      await api(`/auth/${mode}`, { body: payload });
      await qc.invalidateQueries({ queryKey: ['me'] });
      await qc.refetchQueries({ queryKey: ['me'] });
      nav('/dashboard', { replace: true });
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-3">
        <h1 className="text-xl font-bold">{mode === 'login' ? 'Welcome back' : 'Join DevConnect'}</h1>

        {mode === 'register' && (
          <>
            <input className="input" placeholder="Full name" value={form.name} onChange={updateField('name')} required />
            <input className="input" placeholder="Username" value={form.username} onChange={updateField('username')} required />
          </>
        )}

        <input className="input" type="email" placeholder="Email" value={form.email} onChange={updateField('email')} required />
        <input className="input" type="password" placeholder="Password (8+ chars)" value={form.password} onChange={updateField('password')} required />

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button className="btn w-full" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>

        <a className="btn-ghost block text-center" href={`${API}/api/auth/github`}>
          Continue with GitHub
        </a>

        <p className="text-sm text-center">
          {mode === 'login' ? (
            <>
              New here? <Link className="text-indigo-600" to="/register">Register</Link>
            </>
          ) : (
            <>
              Have an account? <Link className="text-indigo-600" to="/login">Log in</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
