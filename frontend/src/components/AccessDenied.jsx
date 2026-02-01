import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function AccessDenied({ requiredRoles = [] }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ padding: '2rem' }}>
      <div
        className="card"
        style={{
          maxWidth: '500px',
          margin: '3rem auto',
          textAlign: 'center',
          padding: '2rem',
          borderLeft: '4px solid var(--danger)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h1 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Access Denied</h1>
        <p className="text-muted mb-3">
          You don't have permission to access this page.
        </p>
        <p className="text-muted text-small mb-4">
          Your role: <strong>{user?.role}</strong>
          {requiredRoles.length > 0 && (
            <>
              <br />
              Required: <strong>{requiredRoles.join(', ')}</strong>
            </>
          )}
        </p>
        <p className="text-muted text-small mb-6">
          Redirecting to dashboard in 3 seconds...
        </p>
        <button
          onClick={() => navigate('/dashboard', { replace: true })}
          className="btn btn-primary"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
}
