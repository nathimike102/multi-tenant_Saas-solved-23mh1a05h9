import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['member', 'tenant_admin']),
});

export default function UserModal({ onSave, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'member' },
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--bg-secondary)', padding: 20, borderRadius: 8, maxWidth: 400, width: '90%', border: '1px solid var(--border)' }}>
        <h2 style={{ color: 'var(--text)' }}>Invite User</h2>
        <form onSubmit={handleSubmit(onSave)}>
          <label style={{ display: 'block', marginBottom: 12, color: 'var(--text)' }}>
            Email
            <input type="email" {...register('email')} placeholder="user@example.com" style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-tertiary)', color: 'var(--text)' }} />
            {errors.email && <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.email.message}</span>}
          </label>

          <label style={{ display: 'block', marginBottom: 12, color: 'var(--text)' }}>
            Full Name
            <input {...register('fullName')} placeholder="John Doe" style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-tertiary)', color: 'var(--text)' }} />
            {errors.fullName && <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.fullName.message}</span>}
          </label>

          <label style={{ display: 'block', marginBottom: 12, color: 'var(--text)' }}>
            Role
            <select {...register('role')} style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-tertiary)', color: 'var(--text)' }}>
              <option value="member">Member</option>
              <option value="tenant_admin">Tenant Admin</option>
            </select>
          </label>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text)' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 12px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Invite</button>
          </div>
        </form>
      </div>
    </div>
  );
}
