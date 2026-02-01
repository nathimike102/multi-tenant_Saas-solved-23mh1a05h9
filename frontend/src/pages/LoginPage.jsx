import { useState, forwardRef } from 'react';
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

const PasswordInput = forwardRef(({ ...props }, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={ref}
        type={show ? 'text' : 'password'}
        {...props}
        placeholder="••••••••"
        style={{
          width: '100%',
          padding: '0.75rem 1rem 0.75rem 2.5rem',
          border: '1px solid var(--border)',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          outline: 'none',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
      />
      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.25rem' }}>🔒</span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setShow((s) => !s);
        }}
        style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        {show ? '👁️' : '�'}
      </button>
    </div>
  );
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
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '0.75rem', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
        {/* Logo/Icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '5rem',
              height: '5rem',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              borderRadius: '50%',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
            }}
          >
            🚀
          </div>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Welcome back</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Sign in to your account</p>

        {serverError && <div className="error">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Email</label>
            <input type="email" {...register('email')} placeholder="you@example.com" />
            {errors.email && <span className="text-danger text-small" style={{ marginTop: '0.25rem' }}>{errors.email.message}</span>}
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Password</label>
            <PasswordInput {...register('password')} />
            {errors.password && <span className="text-danger text-small" style={{ marginTop: '0.25rem' }}>{errors.password.message}</span>}
          </div>

          {/* Subdomain Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Tenant Subdomain</label>
            <input {...register('subdomain')} placeholder="demo" />
            {errors.subdomain && <span className="text-danger text-small" style={{ marginTop: '0.25rem' }}>{errors.subdomain.message}</span>}
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <input
              type="checkbox"
              {...register('remember')}
              id="remember"
              style={{
                width: '1rem',
                height: '1rem',
                cursor: 'pointer',
                accentColor: 'var(--primary)',
              }}
            />
            <label htmlFor="remember" style={{ marginLeft: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{
              marginBottom: '1rem',
              opacity: loading ? '0.7' : '1',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ textAlign: 'center', margin: '1.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Create one
          </Link>
        </div>

        {/* Demo Credentials */}
        <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          <strong style={{ color: 'var(--text)' }}>Demo Credentials:</strong>
          <br />
          Email: admin@demo.com | Pass: Demo@123 | Subdomain: demo
        </div>
      </div>
    </div>
  );
}
