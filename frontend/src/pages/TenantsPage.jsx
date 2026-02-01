import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import client from '../api/client.js';
import AccessDenied from '../components/AccessDenied.jsx';

export default function TenantsPage() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Only super_admin can view this
  if (user?.role !== 'super_admin') {
    return <AccessDenied requiredRoles={['super_admin']} />;
  }

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await client.get('/admin/tenants', {
        params: { limit: 100 },
      });
      setTenants(res.data?.data?.tenants || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  if (loading) return <div className="loading">Loading tenants...</div>;

  return (
    <div>
      <div className="flex-between mb-6">
        <h1>Manage Tenants</h1>
        <button className="btn btn-primary">+ New Tenant</button>
      </div>

      {error && <div className="error">{error}</div>}

      {tenants.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p className="text-muted">No tenants yet.</p>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Subdomain</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Users</th>
                <th>Projects</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td style={{ fontWeight: '500' }}>{tenant.name}</td>
                  <td>
                    <code style={{ background: 'var(--light)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                      {tenant.subdomain}
                    </code>
                  </td>
                  <td>
                    <span className="badge badge-info">{tenant.subscriptionPlan}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${tenant.status === 'active' ? 'success' : 'danger'}`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td>{tenant.userCount || 0}</td>
                  <td>{tenant.projectCount || 0}</td>
                  <td>
                    <button className="btn btn-secondary btn-small">Edit</button>
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
