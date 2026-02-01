import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ projects: 0, tasks: 0, completed: 0, pending: 0, tenants: 0, users: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Super admin dashboard
        if (user?.role === 'super_admin') {
          try {
            const tenantsRes = await client.get('/admin/tenants?limit=5');
            const tenants = tenantsRes.data?.data?.tenants || [];
            
            const usersRes = await client.get('/admin/users?limit=100');
            const allUsers = usersRes.data?.data?.users || [];
            
            setStats({
              projects: 0,
              tasks: 0,
              completed: 0,
              pending: 0,
              tenants: tenants.length,
              users: allUsers.length,
            });
            setRecentProjects(tenants.slice(0, 5));
            setMyTasks([]);
          } catch (e) {
            console.error('Error fetching super admin data:', e);
            setError('Failed to load admin data');
            setStats({
              projects: 0,
              tasks: 0,
              completed: 0,
              pending: 0,
              tenants: 0,
              users: 0,
            });
            setRecentProjects([]);
            setMyTasks([]);
          }
        } else {
          // Regular tenant user
          try {
            const projRes = await client.get(`/tenants/${user?.tenantId}/projects?limit=5`);
            const projects = projRes.data?.data?.projects || [];
            setRecentProjects(projects);

            const tasksRes = await client.get(`/tenants/${user?.tenantId}/projects?limit=100`);
            const allProjects = tasksRes.data?.data?.projects || [];
            let allTasks = [];
            for (const p of allProjects) {
              try {
                const tr = await client.get(`/tenants/${user?.tenantId}/projects/${p.id}/tasks?limit=100`);
                allTasks = allTasks.concat(tr.data?.data?.tasks || []);
              } catch (e) {
                console.error('Error fetching tasks for project:', p.id, e);
              }
            }

            const myTasks = allTasks.filter((t) => t.assignedTo?.id === user?.id);
            setMyTasks(myTasks.slice(0, 10));
            setStats({
              projects: allProjects.length,
              tasks: allTasks.length,
              completed: allTasks.filter((t) => t.status === 'completed').length,
              pending: allTasks.filter((t) => t.status !== 'completed').length,
              tenants: 0,
              users: 0,
            });
          } catch (e) {
            console.error('Error fetching tenant data:', e);
            setError('Failed to load projects');
            setStats({
              projects: 0,
              tasks: 0,
              completed: 0,
              pending: 0,
              tenants: 0,
              users: 0,
            });
            setRecentProjects([]);
            setMyTasks([]);
          }
        }
        setLoading(false);
      } catch (e) {
        console.error('Unexpected error in fetchData:', e);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="loading">Loading your dashboard...</div>;

  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div>
      <h1 className="mb-6">Dashboard</h1>
      {error && <div className="error">{error}</div>}

      {/* Stats Grid */}
      <div className="grid grid-4 mb-6">
        <StatCard label="Projects" value={stats.projects} color="primary" />
        <StatCard label="Tasks" value={stats.tasks} color="success" />
        <StatCard label="Completed" value={stats.completed} color="warning" />
        <StatCard label="Pending" value={stats.pending} color="danger" />
        {isSuperAdmin && <StatCard label="Tenants" value={stats.tenants} color="primary" />}
        {isSuperAdmin && <StatCard label="Users" value={stats.users} color="success" />}
      </div>

      {/* Recent Section */}
      <h2 className="mb-4">{isSuperAdmin ? 'Recent Tenants' : 'Recent Projects'}</h2>
      {recentProjects.length === 0 ? (
        <div className="card mb-6" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="text-muted">
            {isSuperAdmin ? 'No tenants yet.' : 'No projects yet. Create one to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-3 mb-6">
          {recentProjects.map((item) =>
            isSuperAdmin ? (
              <div key={item.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/tenants`)}>
                <h3 className="mb-2">{item.name}</h3>
                <p className="text-muted text-small mb-3">{item.subdomain}</p>
                <div className="flex" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className="badge badge-success">{item.status}</span>
                  <span className="badge badge-primary">{item.subscriptionPlan}</span>
                </div>
                <div className="text-small text-muted">
                  <div>Users: {item.userCount || 0}</div>
                  <div>Projects: {item.projectCount || 0}</div>
                </div>
              </div>
            ) : (
              <div
                key={item.id}
                className="card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/projects/${item.id}`)}
              >
                <h3 className="mb-2">{item.name}</h3>
                <p className="text-muted text-small mb-3">{item.description}</p>
                <div className="flex" style={{ gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-info">{item.status}</span>
                  <span className="text-small text-muted">{item.taskCount || 0} tasks</span>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* My Tasks */}
      {!isSuperAdmin && (
        <>
          <h2 className="mb-4">My Tasks</h2>
          {myTasks.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p className="text-muted">No tasks assigned to you.</p>
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
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myTasks.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: '500' }}>{t.title}</td>
                      <td>
                        <Link to={`/projects/${t.projectId}`} style={{ color: 'var(--primary)' }}>
                          {t.projectName || 'Project'}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge badge-${getStatusColor(t.status)}`}>{t.status}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${getPriorityColor(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td>
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color = 'primary' }) {
  const icons = {
    primary: '📊',
    success: '✅',
    warning: '⚠️',
    danger: '⏱️',
  };

  return (
    <div
      className="card"
      style={{
        padding: '1.5rem',
        textAlign: 'center',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.7 }}>{icons[color]}</div>
      <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
}

function getStatusColor(status) {
  const map = {
    todo: 'info',
    'in-progress': 'warning',
    completed: 'success',
  };
  return map[status] || 'info';
}

function getPriorityColor(priority) {
  const map = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
  };
  return map[priority] || 'info';
}
