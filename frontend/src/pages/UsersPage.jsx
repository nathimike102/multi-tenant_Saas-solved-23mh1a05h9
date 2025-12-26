import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import client from '../api/client';
import UserModal from '../components/UserModal';

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/tenants/${user?.tenantId}/users`, {
        params: { search, limit: 100 },
      });
      setUsers(res.data.data.users || []);
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Users</h1>
        <button onClick={() => setShowModal(true)} style={{ padding: '8px 12px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          + Invite User
        </button>
      </div>

      {error && <div style={{ color: '#d00', marginBottom: 12 }}>{error}</div>}

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 300, padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6 }}
        />
      </div>

      {users.length === 0 ? (
        <p style={{ color: '#999' }}>No users. Invite team members to get started.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Joined</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{u.fullName}</td>
                <td style={{ padding: 8 }}>{u.email}</td>
                <td style={{ padding: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, background: u.role === 'super_admin' ? '#e3f2fd' : u.role === 'tenant_admin' ? '#f3e5f5' : '#f5f5f5', fontSize: 12 }}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: 8, fontSize: 12, color: '#666' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}>
                  {u.id !== user?.id && (
                    <button onClick={() => handleDelete(u.id)} style={{ padding: '4px 8px', background: '#fee', border: '1px solid #faa', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && <UserModal onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
