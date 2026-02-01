import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const role = user?.role;

  const getNavLink = (to, label) => (
    <NavLink
      to={to}
      className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
      style={({ isActive }) => ({
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        transition: 'all 0.2s',
        color: isActive ? 'white' : 'var(--text-secondary)',
        background: isActive ? 'var(--primary)' : 'transparent',
      })}
    >
      {label}
    </NavLink>
  );

  return (
    <nav style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
        <div className="flex" style={{ alignItems: 'center', gap: '2rem' }}>
          <Link to="/dashboard" style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🚀 Nathi
          </Link>
          <div className="flex" style={{ gap: '0.5rem' }}>
            {getNavLink('/dashboard', 'Dashboard')}
            {getNavLink('/projects', 'Projects')}
            {(role === 'tenant_admin' || role === 'super_admin') && getNavLink('/tasks', 'Tasks')}
            {(role === 'tenant_admin' || role === 'super_admin') && getNavLink('/users', 'Users')}
            {role === 'super_admin' && getNavLink('/tenants', 'Tenants')}
          </div>
        </div>
        <div className="flex" style={{ alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '500', color: 'var(--text)' }}>{user?.fullName}</div>
            <div
              className="badge badge-primary"
              style={{
                marginTop: '0.25rem',
                textTransform: 'capitalize',
              }}
            >
              {user?.role}
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-small"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
