import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import client from '../api/client.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, tasks: 0, completed: 0, pending: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projRes = await client.get(`/tenants/${user?.tenantId}/projects?limit=5`);
        const projects = projRes.data.data.projects || [];
        setRecentProjects(projects);

        const tasksRes = await client.get(`/tenants/${user?.tenantId}/projects?limit=100`);
        const allProjects = tasksRes.data.data.projects || [];
        let allTasks = [];
        for (const p of allProjects) {
          try {
            const tr = await client.get(`/tenants/${user?.tenantId}/projects/${p.id}/tasks?limit=100`);
            allTasks = allTasks.concat(tr.data.data.tasks || []);
          } catch {}
        }

        const myTasks = allTasks.filter((t) => t.assignedTo?.id === user?.id);
        setMyTasks(myTasks.slice(0, 10));
        setStats({
          projects: allProjects.length,
          tasks: allTasks.length,
          completed: allTasks.filter((t) => t.status === 'completed').length,
          pending: allTasks.filter((t) => t.status !== 'completed').length,
        });
        setLoading(false);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load dashboard');
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <div style={{ color: '#d00', marginBottom: 12 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 32 }}>
        <StatCard label="Projects" value={stats.projects} />
        <StatCard label="Tasks" value={stats.tasks} />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Pending" value={stats.pending} />
      </div>

      <h2>Recent Projects</h2>
      {recentProjects.length === 0 ? (
        <p style={{ color: '#999' }}>No projects yet. Create one to get started.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
          {recentProjects.map((p) => (
            <div key={p.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
              <h3 style={{ margin: '0 0 6px' }}>{p.name}</h3>
              <p style={{ margin: '0 0 6px', fontSize: 12, color: '#666' }}>{p.description}</p>
              <div style={{ fontSize: 12, color: '#666' }}>{p.taskCount || 0} tasks</div>
              <div style={{ marginTop: 6, fontSize: 11, color: '#999' }}>Status: {p.status}</div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ marginTop: 32 }}>My Tasks</h2>
      {myTasks.length === 0 ? (
        <p style={{ color: '#999' }}>No tasks assigned to you.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Title</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Project</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Priority</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {myTasks.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{t.title}</td>
                <td style={{ padding: 8 }}>Project</td>
                <td style={{ padding: 8 }}><span style={statusBadge(t.status)}>{t.status}</span></td>
                <td style={{ padding: 8 }}><span style={priorityBadge(t.priority)}>{t.priority}</span></td>
                <td style={{ padding: 8 }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 6, textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function statusBadge(status) {
  const colors = { todo: '#d0d0d0', in_progress: '#fff4a8', completed: '#a8ffa8' };
  return { display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 12, background: colors[status] || '#f0f0f0' };
}

function priorityBadge(priority) {
  const colors = { low: '#d0d0d0', medium: '#fff4a8', high: '#ffa8a8' };
  return { display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 12, background: colors[priority] || '#f0f0f0' };
}
