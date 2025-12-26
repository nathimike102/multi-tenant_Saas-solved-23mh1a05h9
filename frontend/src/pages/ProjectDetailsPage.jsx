import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import client from '../api/client';
import TaskModal from '../components/TaskModal';

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/tenants/${user?.tenantId}/projects/${projectId}`);
      setProject(res.data.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const params = { limit: 100 };
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      const res = await client.get(`/tenants/${user?.tenantId}/projects/${projectId}/tasks`, { params });
      setTasks(res.data.data.tasks || []);
    } catch (e) {
      console.error('Failed to fetch tasks:', e);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId, user]);

  useEffect(() => {
    if (project) {
      fetchTasks();
    }
  }, [project, filterStatus, filterPriority]);

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project?')) return;
    try {
      await client.delete(`/tenants/${user?.tenantId}/projects/${projectId}`);
      navigate('/projects');
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleSaveTask = async (data) => {
    try {
      await client.post(`/tenants/${user?.tenantId}/projects/${projectId}/tasks`, data);
      setShowTaskModal(false);
      fetchTasks();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete task?')) return;
    try {
      await client.delete(`/tenants/${user?.tenantId}/projects/${projectId}/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await client.patch(`/tenants/${user?.tenantId}/projects/${projectId}/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to update task');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>{error || 'Project not found'}</div>;

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate('/projects')} style={{ marginBottom: 12, padding: '6px 10px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          ← Back to Projects
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1>{project.name}</h1>
            <p style={{ color: '#666', marginBottom: 8 }}>{project.description}</p>
            <div style={{ display: 'flex', gap: 12, fontSize: 14 }}>
              <span><strong>Status:</strong> {project.status}</span>
              <span><strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <button onClick={handleDeleteProject} style={{ padding: '8px 12px', background: '#fee', border: '1px solid #faa', borderRadius: 6, cursor: 'pointer', color: '#d00' }}>
            Delete Project
          </button>
        </div>
      </div>

      <hr style={{ margin: '20px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Tasks ({filteredTasks.length})</h2>
        <button onClick={() => setShowTaskModal(true)} style={{ padding: '8px 12px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          + New Task
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6 }}>
          <option value="">All Status</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6 }}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {filteredTasks.length === 0 ? (
        <p style={{ color: '#999' }}>No tasks. Create one to get started.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Title</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Priority</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Assigned To</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Due Date</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{task.title}</td>
                <td style={{ padding: 8 }}>
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                    style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, background: '#fff' }}
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </td>
                <td style={{ padding: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, background: task.priority === 'high' ? '#fee' : task.priority === 'medium' ? '#fef3cd' : '#f0f0f0', fontSize: 12 }}>
                    {task.priority}
                  </span>
                </td>
                <td style={{ padding: 8, fontSize: 14 }}>{task.assignedTo?.fullName || '—'}</td>
                <td style={{ padding: 8, fontSize: 14, color: '#666' }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => handleDeleteTask(task.id)} style={{ padding: '4px 8px', background: '#fee', border: '1px solid #faa', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showTaskModal && <TaskModal onSave={handleSaveTask} onClose={() => setShowTaskModal(false)} />}
    </div>
  );
}
