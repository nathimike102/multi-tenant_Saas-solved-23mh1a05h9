import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProjectDetailsPage from './pages/ProjectDetailsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import TenantsPage from './pages/TenantsPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Routes accessible to all authenticated users */}
      <Route element={<ProtectedRoute />}> 
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
        </Route>
      </Route>

      {/* Routes for tenant_admin and super_admin only */}
      <Route element={<ProtectedRoute allowedRoles={['tenant_admin', 'super_admin']} />}>
        <Route element={<Layout />}>
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>

      {/* Routes for super_admin only */}
      <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
        <Route element={<Layout />}>
          <Route path="/tenants" element={<TenantsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
