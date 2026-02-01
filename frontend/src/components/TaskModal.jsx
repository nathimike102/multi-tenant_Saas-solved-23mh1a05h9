import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
  dueDate: z.string().optional(),
});

export default function TaskModal({ onSave, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium', status: 'todo' },
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--bg-secondary)', padding: 20, borderRadius: 8, maxWidth: 400, width: '90%', border: '1px solid var(--border)' }}>
        <h2 style={{ color: 'var(--text)' }}>New Task</h2>
        <form onSubmit={handleSubmit(onSave)}>
          <label style={{ display: 'block', marginBottom: 12, color: 'var(--text)' }}>
            Task Title
            <input {...register('title')} placeholder="Task title" style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-tertiary)', color: 'var(--text)' }} />
            {errors.title && <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.title.message}</span>}
          </label>

          <label style={{ display: 'block', marginBottom: 12, color: 'var(--text)' }}>
            Description
            <textarea {...register('description')} placeholder="Optional description" style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid var(--border)', borderRadius: 6, minHeight: 80, background: 'var(--bg-tertiary)', color: 'var(--text)' }} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <label style={{ color: 'var(--text)' }}>
              Priority
              <select {...register('priority')} style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-tertiary)', color: 'var(--text)' }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label style={{ color: 'var(--text)' }}>
              Status
              <select {...register('status')} style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-tertiary)', color: 'var(--text)' }}>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>

          <label style={{ display: 'block', marginBottom: 12, color: 'var(--text)' }}>
            Due Date
            <input type="date" {...register('dueDate')} style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-tertiary)', color: 'var(--text)' }} />
          </label>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text)' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 12px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
