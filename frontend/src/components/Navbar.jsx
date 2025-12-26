import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const role = user?.role;

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <Link to="/dashboard" style={styles.brand}>SaaS</Link>
        <nav style={styles.nav}>
          <NavLink to="/dashboard" style={styles.link}>Dashboard</NavLink>
          <NavLink to="/projects" style={styles.link}>Projects</NavLink>
          {(role === 'tenant_admin' || role === 'super_admin') && (
            <NavLink to="/tasks" style={styles.link}>Tasks</NavLink>
          )}
          {role === 'tenant_admin' && (
            <NavLink to="/users" style={styles.link}>Users</NavLink>
          )}
          {role === 'super_admin' && (
            <NavLink to="/tenants" style={styles.link}>Tenants</NavLink>
          )}
        </nav>
      </div>
      <div style={styles.right}>
        <div style={{ marginRight: 12, color: '#444' }}>
          {user?.fullName} <span style={styles.roleBadge}>{user?.role}</span>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>
    </header>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 10 },
  left: { display: 'flex', alignItems: 'center', gap: 16 },
  brand: { fontWeight: 700, textDecoration: 'none', color: '#111', marginRight: 8 },
  nav: { display: 'flex', gap: 12 },
  link: ({ isActive }) => ({ textDecoration: 'none', color: isActive ? '#111' : '#555', fontWeight: isActive ? 600 : 400 }),
  right: { display: 'flex', alignItems: 'center' },
  roleBadge: { padding: '2px 6px', background: '#f3f3f3', borderRadius: 6, fontSize: 12, marginLeft: 6 },
  logoutBtn: { padding: '6px 10px', background: '#eee', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' },
};
