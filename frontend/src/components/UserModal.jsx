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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, maxWidth: 400, width: '90%' }}>
        <h2>Invite User</h2>
        <form onSubmit={handleSubmit(onSave)}>
          <label style={{ display: 'block', marginBottom: 12 }}>
            Email
            <input type="email" {...register('email')} placeholder="user@example.com" style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #ddd', borderRadius: 6 }} />
            {errors.email && <span style={{ color: '#d00', fontSize: 12 }}>{errors.email.message}</span>}
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            Full Name
            <input {...register('fullName')} placeholder="John Doe" style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #ddd', borderRadius: 6 }} />
            {errors.fullName && <span style={{ color: '#d00', fontSize: 12 }}>{errors.fullName.message}</span>}
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            Role
            <select {...register('role')} style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #ddd', borderRadius: 6 }}>
              <option value="member">Member</option>
              <option value="tenant_admin">Tenant Admin</option>
            </select>
          </label>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 12px', background: '#eee', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 12px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Invite</button>
          </div>
        </form>
      </div>
    </div>
  );
}
