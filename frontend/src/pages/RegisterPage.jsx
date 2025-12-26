import { useState } from 'react';
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
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 24 }}>
      <h1>Create your organization</h1>
      <p style={{ color: '#666' }}>Register your tenant and admin account.</p>

      {serverError && (
        <div style={{ background: '#ffe3e3', padding: 12, borderRadius: 6, marginBottom: 16 }}>{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          Organization Name
          <input {...register('tenantName')} placeholder="Acme Inc." />
          {errors.tenantName && <span className="err">{errors.tenantName.message}</span>}
        </label>

        <label style={{ display: 'block', marginTop: 12 }}>
          Subdomain
          <input {...register('subdomain')} placeholder="your-company" />
          <div style={{ fontSize: 12, color: '#666' }}>Preview: {sub || 'your-company'}.yourapp.com</div>
          {errors.subdomain && <span className="err">{errors.subdomain.message}</span>}
        </label>

        <label style={{ display: 'block', marginTop: 12 }}>
          Admin Email
          <input type="email" {...register('adminEmail')} placeholder="admin@company.com" />
          {errors.adminEmail && <span className="err">{errors.adminEmail.message}</span>}
        </label>

        <label style={{ display: 'block', marginTop: 12 }}>
          Admin Full Name
          <input {...register('adminFullName')} placeholder="Jane Doe" />
          {errors.adminFullName && <span className="err">{errors.adminFullName.message}</span>}
        </label>

        <label style={{ display: 'block', marginTop: 12 }}>
          Password
          <PasswordInput {...register('password')} />
          {errors.password && <span className="err">{errors.password.message}</span>}
        </label>

        <label style={{ display: 'block', marginTop: 12 }}>
          Confirm Password
          <PasswordInput {...register('confirmPassword')} />
          {errors.confirmPassword && <span className="err">{errors.confirmPassword.message}</span>}
        </label>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
          <input type="checkbox" {...register('terms')} /> I agree to the Terms & Conditions
        </label>
        {errors.terms && <span className="err">{errors.terms.message}</span>}

        <button type="submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? 'Creating...' : 'Create organization'}
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </div>

      <style>{`
        input, button { display:block; width:100%; padding:10px; margin-top:6px; }
        .err { color:#d00; font-size:12px; }
      `}</style>
    </div>
  );
}

function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input type={show ? 'text' : 'password'} {...props} />
      <button type="button" onClick={() => setShow((s) => !s)} style={{ position: 'absolute', right: 6, top: 6, width: 'auto' }}>
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
