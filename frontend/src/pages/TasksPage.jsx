import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import client from '../api/client.js';
import AccessDenied from '../components/AccessDenied.jsx';

export default function TasksPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Tasks visible to: tenant_admin and super_admin
  if (user?.role === 'user') {
    return <AccessDenied requiredRoles={['tenant_admin', 'super_admin']} />;
  }

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      // For super_admin, get all tasks; otherwise get tenant tasks
      if (isSuperAdmin) {
        setTasks([]);
        setError('Super administrators must select a tenant to view tasks.');
        return;
      } else {
        // Get all projects first, then their tasks
        const projRes = await client.get(`/tenants/${user?.tenantId}/projects?limit=100`);
        const projects = projRes.data?.data?.projects || [];
        
        let allTasks = [];
        for (const p of projects) {
          try {
            const tr = await client.get(`/tenants/${user?.tenantId}/projects/${p.id}/tasks?limit=100`);
            const taskList = tr.data?.data?.tasks || [];
            allTasks = allTasks.concat(taskList.map(t => ({ ...t, projectName: p.name })));
          } catch {}
        }
        
        // Apply filters
        let filtered = allTasks;
        if (filterStatus) filtered = filtered.filter(t => t.status === filterStatus);
        if (filterPriority) filtered = filtered.filter(t => t.priority === filterPriority);
        
        setTasks(filtered);
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, filterStatus, filterPriority]);

  if (loading) return <div className="loading">Loading tasks...</div>;

  const getPriorityColor = (priority) => {
    const map = {
      low: 'info',
      medium: 'warning',
      high: 'danger',
    };
    return map[priority] || 'info';
  };

  return (
    <div>
      <h1 className="mb-6">Tasks</h1>

      {error && <div className="error">{error}</div>}

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div>
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label>Priority</label>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p className="text-muted">No tasks found. Create one to get started.</p>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td style={{ fontWeight: '500' }}>{task.title}</td>
                  <td>{task.projectName || 'Unknown'}</td>
                  <td>
                    <span className="badge badge-info">{task.status}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>{task.assignedTo?.fullName || '—'}</td>
                  <td>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
