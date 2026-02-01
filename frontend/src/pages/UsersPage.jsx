import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import client from '../api/client.js';
import UserModal from '../components/UserModal.jsx';
import AccessDenied from '../components/AccessDenied.jsx';

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  // Users visible to: tenant_admin and super_admin
  if (user?.role === 'user') {
    return <AccessDenied requiredRoles={['tenant_admin', 'super_admin']} />;
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/tenants/${user?.tenantId}/users`, {
        params: { search, limit: 100 },
      });
      setUsers(res.data?.data?.users || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user, search]);

  const handleDelete = async (userId) => {
    if (!confirm('Remove user from tenant?')) return;
    try {
      await client.delete(`/tenants/${user?.tenantId}/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSave = async (data) => {
    try {
      await client.post(`/tenants/${user?.tenantId}/users`, data);
      setShowModal(false);
      fetchUsers();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to save user');
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div>
      <div className="flex-between mb-6">
        <h1>Users</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Invite User
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {users.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p className="text-muted">No users. Invite team members to get started.</p>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: '500' }}>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge badge-primary">{u.role}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${u.isActive ? 'success' : 'danger'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(u.id)} className="btn btn-danger btn-small">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <UserModal onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
