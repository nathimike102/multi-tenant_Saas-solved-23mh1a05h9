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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, maxWidth: 400, width: '90%' }}>
        <h2>New Task</h2>
        <form onSubmit={handleSubmit(onSave)}>
          <label style={{ display: 'block', marginBottom: 12 }}>
            Task Title
            <input {...register('title')} placeholder="Task title" style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #ddd', borderRadius: 6 }} />
            {errors.title && <span style={{ color: '#d00', fontSize: 12 }}>{errors.title.message}</span>}
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            Description
            <textarea {...register('description')} placeholder="Optional description" style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #ddd', borderRadius: 6, minHeight: 80 }} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <label>
              Priority
              <select {...register('priority')} style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #ddd', borderRadius: 6 }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              Status
              <select {...register('status')} style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #ddd', borderRadius: 6 }}>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>

          <label style={{ display: 'block', marginBottom: 12 }}>
            Due Date
            <input type="date" {...register('dueDate')} style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #ddd', borderRadius: 6 }} />
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
