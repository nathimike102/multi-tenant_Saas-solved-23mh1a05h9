import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(2, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'archived', 'completed']),
});

export default function ProjectModal({ onSave, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, maxWidth: 400, width: '90%' }}>
        <h2>New Project</h2>
        <form onSubmit={handleSubmit(onSave)}>
          <label style={{ display: 'block', marginBottom: 12 }}>
            Project Name
            <input {...register('name')} placeholder="Project name" style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #ddd', borderRadius: 6 }} />
            {errors.name && <span style={{ color: '#d00', fontSize: 12 }}>{errors.name.message}</span>}
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            Description
            <textarea {...register('description')} placeholder="Optional description" style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #ddd', borderRadius: 6, minHeight: 80 }} />
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            Status
            <select {...register('status')} style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #ddd', borderRadius: 6 }}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 12px', background: '#eee', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 12px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
