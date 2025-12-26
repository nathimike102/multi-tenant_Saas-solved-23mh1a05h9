import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
  subdomain: z.string().min(1, 'Subdomain required'),
  remember: z.boolean().optional(),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { remember: true } });

  const onSubmit = async (values) => {
    setServerError('');
    setLoading(true);
    try {
      // For now, subdomain is used as context only; backend login uses email/password.
      await login(values.email, values.password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (e) {
      const msg = e?.response?.data?.message || 'Login failed';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 24 }}>
      <h1>Welcome back</h1>
      <p style={{ color: '#666' }}>Sign in to continue</p>

      {serverError && (
        <div style={{ background: '#ffe3e3', padding: 12, borderRadius: 6, marginBottom: 16 }}>{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          Email
          <input type="email" {...register('email')} placeholder="you@company.com" />
          {errors.email && <span className="err">{errors.email.message}</span>}
        </label>

        <label style={{ display: 'block', marginTop: 12 }}>
          Password
          <input type="password" {...register('password')} placeholder="••••••••" />
          {errors.password && <span className="err">{errors.password.message}</span>}
        </label>

        <label style={{ display: 'block', marginTop: 12 }}>
          Tenant Subdomain
          <input {...register('subdomain')} placeholder="your-company" />
          {errors.subdomain && <span className="err">{errors.subdomain.message}</span>}
        </label>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
          <input type="checkbox" {...register('remember')} /> Remember me
        </label>

        <button type="submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        New here? <Link to="/register">Create an organization</Link>
      </div>

      <style>{`
        input, button { display:block; width:100%; padding:10px; margin-top:6px; }
        .err { color:#d00; font-size:12px; }
      `}</style>
    </div>
  );
}
