import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <div>
      <Navbar />
      <main className="container" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
