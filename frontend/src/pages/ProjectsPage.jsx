import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import ProjectModal from '../components/ProjectModal.jsx';

export default function ProjectsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      if (isSuperAdmin) {
        setProjects([]);
        setError('Super administrators must select a tenant to manage projects.');
        return;
      }
      const res = await client.get(`/tenants/${user?.tenantId}/projects`, {
        params: { status: filterStatus, search, limit: 100 },
      });
      setProjects(res.data.data.projects || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user, filterStatus, search]);

  const handleDelete = async (id) => {
    if (isSuperAdmin) {
      alert('Super administrators must select a tenant to manage projects.');
      return;
    }
    if (!confirm('Delete project?')) return;
    try {
      await client.delete(`/tenants/${user?.tenantId}/projects/${id}`);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete');
    }
  };

  const handleSave = async (data) => {
    if (isSuperAdmin) {
      alert('Super administrators must select a tenant to manage projects.');
      return;
    }
    try {
      await client.post(`/tenants/${user?.tenantId}/projects`, data);
      setShowModal(false);
      fetchProjects();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to save project');
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div>
      <div className="flex-between mb-6">
        <h1>Projects</h1>
        {!isSuperAdmin && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + New Project
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div>
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p className="text-muted">No projects. Create one to get started.</p>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Tasks</th>
                <th>Created</th>
                {!isSuperAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '500' }}>
                    <Link to={`/projects/${p.id}`} style={{ color: 'var(--primary)' }}>
                      {p.name}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge badge-${p.status === 'active' ? 'success' : 'info'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.taskCount || 0}</td>
                  <td className="text-small text-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                  {!isSuperAdmin && (
                    <td>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="btn btn-danger btn-small"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <ProjectModal onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
