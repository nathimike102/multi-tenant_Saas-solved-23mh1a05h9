import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import client from '../api/client.js';
import ProjectModal from '../components/ProjectModal.jsx';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
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
    if (!confirm('Delete project?')) return;
    try {
      await client.delete(`/tenants/${user?.tenantId}/projects/${id}`);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete');
    }
  };

  const handleSave = async (data) => {
    try {
      await client.post(`/tenants/${user?.tenantId}/projects`, data);
      setShowModal(false);
      fetchProjects();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to save project');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Projects</h1>
        <button onClick={() => setShowModal(true)} style={{ padding: '8px 12px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          + New Project
        </button>
      </div>

      {error && <div style={{ color: '#d00', marginBottom: 12 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6 }}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6 }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {projects.length === 0 ? (
        <p style={{ color: '#999' }}>No projects. Create one to get started.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Tasks</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Created</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}><a href={`/projects/${p.id}`} style={{ color: '#111', textDecoration: 'none' }}>{p.name}</a></td>
                <td style={{ padding: 8 }}>{p.status}</td>
                <td style={{ padding: 8 }}>{p.taskCount || 0}</td>
                <td style={{ padding: 8, fontSize: 12, color: '#666' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => handleDelete(p.id)} style={{ padding: '4px 8px', background: '#fee', border: '1px solid #faa', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && <ProjectModal onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
