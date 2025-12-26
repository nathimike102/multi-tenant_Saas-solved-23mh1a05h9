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
    <div style={{ position: 'relative', marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 6, border: '1px solid #ddd' }}>
        <span style={{ padding: '0 12px', fontSize: 18 }}>🔒</span>
        <input ref={ref} type={show ? 'text' : 'password'} {...props} placeholder="••••••••" style={{ flex: 1, border: 'none', padding: '12px 0', outline: 'none' }} />
        <button type="button" onClick={(e) => { e.preventDefault(); setShow((s) => !s); }} style={{ padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
          {show ? '👁️' : '😴'}
        </button>
      </div>
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d4a574 0%, #d4a574 20%, #e8959a 40%, #d4689e 60%, #8b5fb5 80%, #4a5ba8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ maxWidth: 420, width: '100%', background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        {/* User Icon */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #d4a574, #e8959a)', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
            👤
          </div>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: 28, marginBottom: 8 }}>Welcome back</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}>Sign in to continue</p>

        {serverError && (
          <div style={{ background: '#ffe3e3', padding: 12, borderRadius: 6, marginBottom: 16, color: '#d00', fontSize: 14 }}>{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email Field */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 6, border: '1px solid #ddd', marginBottom: 4 }}>
            <span style={{ padding: '0 12px', fontSize: 18 }}>👤</span>
            <input type="email" {...register('email')} placeholder="Email address" style={{ flex: 1, border: 'none', padding: '12px 0', outline: 'none' }} />
          </div>
          {errors.email && <span style={{ color: '#d00', fontSize: 12 }}>{errors.email.message}</span>}

          {/* Password Field */}
          <PasswordInput {...register('password')} />
          {errors.password && <span style={{ color: '#d00', fontSize: 12 }}>{errors.password.message}</span>}

          {/* Subdomain Field */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 6, border: '1px solid #ddd', marginTop: 12 }}>
            <span style={{ padding: '0 12px', fontSize: 18 }}>🏢</span>
            <input {...register('subdomain')} placeholder="Tenant subdomain" style={{ flex: 1, border: 'none', padding: '12px 0', outline: 'none' }} />
          </div>
          {errors.subdomain && <span style={{ color: '#d00', fontSize: 12 }}>{errors.subdomain.message}</span>}

          {/* Remember & Forgot */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 20 }}>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" {...register('remember')} />
              <span style={{ fontSize: 14 }}>Remember me</span>
            </label>
            <Link to="#" style={{ fontSize: 14, color: '#d4689e', textDecoration: 'none' }}>Forgot Password?</Link>
          </div>

          {/* Login Button */}
          <button type="submit" disabled={loading} style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #d4a574, #e8959a)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 16,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Signing in…' : 'LOGIN'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#666' }}>
          New here? <Link to="/register" style={{ color: '#d4689e', textDecoration: 'none', fontWeight: 600 }}>Create an organization</Link>
        </div>
      </div>
    </div>
  );
}
