import { useState, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import client from '../api/client.js';
import { Link, useNavigate } from 'react-router-dom';

const schema = z
  .object({
    tenantName: z.string().min(2, 'Organization name is required'),
    subdomain: z
      .string()
      .min(3, 'Subdomain must be at least 3 characters')
      .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes only'),
    adminEmail: z.string().email('Valid email required'),
    adminFullName: z.string().min(2, 'Full name required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include an uppercase letter')
      .regex(/[a-z]/, 'Include a lowercase letter')
      .regex(/[0-9]/, 'Include a number'),
    confirmPassword: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: 'You must accept Terms & Conditions' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const sub = watch('subdomain') || '';

  const onSubmit = async (values) => {
    setServerError('');
    setLoading(true);
    try {
      const payload = {
        tenantName: values.tenantName,
        subdomain: values.subdomain,
        adminEmail: values.adminEmail,
        adminFullName: values.adminFullName,
        adminPassword: values.password,
      };
      await client.post('/auth/register-tenant', payload);
      alert('Registration successful! You can now log in.');
      navigate('/login');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Registration failed';
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
      <div style={{ maxWidth: 480, width: '100%', background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #d4a574, #e8959a)', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
            🏢
          </div>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: 28, marginBottom: 8 }}>Create your organization</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}>Register your tenant and admin account.</p>

        {serverError && (
          <div style={{ background: '#ffe3e3', padding: 12, borderRadius: 6, marginBottom: 16, color: '#d00', fontSize: 14 }}>{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 6, border: '1px solid #ddd', marginBottom: 4 }}>
            <span style={{ padding: '0 12px', fontSize: 18 }}>🏢</span>
            <input {...register('tenantName')} placeholder="Organization Name" style={{ flex: 1, border: 'none', padding: '12px 0', outline: 'none' }} />
          </div>
          {errors.tenantName && <span style={{ color: '#d00', fontSize: 12 }}>{errors.tenantName.message}</span>}

          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 6, border: '1px solid #ddd', marginTop: 12 }}>
            <span style={{ padding: '0 12px', fontSize: 18 }}>🌐</span>
            <input {...register('subdomain')} placeholder="your-company" style={{ flex: 1, border: 'none', padding: '12px 0', outline: 'none' }} />
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Preview: {sub || 'your-company'}.yourapp.com</div>
          {errors.subdomain && <span style={{ color: '#d00', fontSize: 12 }}>{errors.subdomain.message}</span>}

          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 6, border: '1px solid #ddd', marginTop: 12 }}>
            <span style={{ padding: '0 12px', fontSize: 18 }}>📧</span>
            <input type="email" {...register('adminEmail')} placeholder="Admin Email" style={{ flex: 1, border: 'none', padding: '12px 0', outline: 'none' }} />
          </div>
          {errors.adminEmail && <span style={{ color: '#d00', fontSize: 12 }}>{errors.adminEmail.message}</span>}

          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 6, border: '1px solid #ddd', marginTop: 12 }}>
            <span style={{ padding: '0 12px', fontSize: 18 }}>👤</span>
            <input {...register('adminFullName')} placeholder="Admin Full Name" style={{ flex: 1, border: 'none', padding: '12px 0', outline: 'none' }} />
          </div>
          {errors.adminFullName && <span style={{ color: '#d00', fontSize: 12 }}>{errors.adminFullName.message}</span>}

          <PasswordInput {...register('password')} />
          {errors.password && <span style={{ color: '#d00', fontSize: 12 }}>{errors.password.message}</span>}

          <PasswordInput {...register('confirmPassword')} />
          {errors.confirmPassword && <span style={{ color: '#d00', fontSize: 12 }}>{errors.confirmPassword.message}</span>}

          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16, marginBottom: 20, cursor: 'pointer' }}>
            <input type="checkbox" {...register('terms')} />
            <span style={{ fontSize: 14 }}>I agree to the Terms & Conditions</span>
          </label>
          {errors.terms && <span style={{ color: '#d00', fontSize: 12 }}>{errors.terms.message}</span>}

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
            {loading ? 'Creating...' : 'CREATE ORGANIZATION'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#666' }}>
          Already have an account? <Link to="/login" style={{ color: '#d4689e', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
