'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import '../../../employees/employees.css';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (taskId) {
      fetchTask();
      fetchEmployees();
      fetchProjects();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`);
      const data = await response.json();

      if (data.success) {
        setFormData(data.task);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Task Not Found',
          text: 'The task you are looking for does not exist.',
          confirmButtonColor: '#b14cff',
          background: '#0d0d0d',
          color: '#fff'
        }).then(() => {
          router.push('/admin/tasks');
        });
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Task',
        text: 'Could not fetch task data. Please try again.',
        confirmButtonColor: '#b14cff',
        background: '#0d0d0d',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      if (data.success) {
        const activeEmployees = data.employees.filter(emp => 
          emp.status === 'Active' && emp.loginEnabled
        );
        setEmployees(activeEmployees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/employees/projects');
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'assignedTo') {
      const selectedEmployee = employees.find(emp => emp.id === value);
      setFormData(prev => ({
        ...prev,
        assignedTo: value,
        assignedToName: selectedEmployee ? selectedEmployee.name : ''
      }));
    }
    else if (name === 'projectId') {
      const selectedProject = projects.find(proj => proj.id === value);
      setFormData(prev => ({
        ...prev,
        projectId: value,
        projectName: selectedProject ? selectedProject.projectName : ''
      }));
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: taskId, ...formData })
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Task Updated Successfully! ✅',
          text: 'Task has been updated in the system',
          confirmButtonText: 'View Tasks',
          confirmButtonColor: '#b14cff',
          background: '#0d0d0d',
          color: '#fff',
          timer: 2000,
          timerProgressBar: true
        }).then(() => {
          router.push('/admin/tasks');
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.message || 'Could not update task. Please try again.',
        confirmButtonColor: '#b14cff',
        background: '#0d0d0d',
        color: '#fff'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return null; // Global loader will handle this
  }

  if (!formData) {
    return null;
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Edit Task</h1>
        <button
          className="back-btn"
          onClick={() => router.push('/admin/tasks')}
        >
          ← Back to Tasks
        </button>
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
        {/* Current Status */}
        <div className="form-section">
          <h2>Current Status</h2>
          <div style={{
            background: 'rgba(177, 76, 255, 0.1)',
            border: '1px solid rgba(177, 76, 255, 0.3)',
            borderRadius: '12px',
            padding: '15px',
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <span className={`badge ${
              formData.status === 'To Do' ? 'status-todo' :
              formData.status === 'In Progress' ? 'status-in-progress' :
              formData.status === 'Completed' ? 'status-completed' :
              formData.status === 'Approved' ? 'status-approved' :
              'status-rejected'
            }`}>
              Status: {formData.status}
            </span>
            <span className="badge status-in-progress">
              Progress: {formData.progress || 0}%
            </span>
            {formData.completedAt && (
              <span className="badge status-completed">
                Completed: {new Date(formData.completedAt.seconds * 1000).toLocaleDateString('en-GB')}
              </span>
            )}
          </div>
        </div>

        {/* Task Details */}
        <div className="form-section">
          <h2>Task Details</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Task Title *</label>
              <input
                type="text"
                name="taskTitle"
                value={formData.taskTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Task Description</label>
              <textarea
                name="taskDescription"
                value={formData.taskDescription || ''}
                onChange={handleChange}
                rows="4"
              />
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div className="form-section">
          <h2>Assignment</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Assign To Employee *</label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                required
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeId}) - {emp.designation}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Link to Project (Optional)</label>
              <select
                name="projectId"
                value={formData.projectId || ''}
                onChange={handleChange}
              >
                <option value="">No Project</option>
                {projects.map(proj => (
                  <option key={proj.id} value={proj.id}>
                    {proj.projectName} - {proj.clientName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Priority & Deadline */}
        <div className="form-section">
          <h2>Priority & Timeline</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Priority *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Deadline *</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Completion Report (if completed) */}
        {formData.completionReport && (
          <div className="form-section">
            <h2>Completion Report</h2>
            <div style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <p style={{ margin: 0, color: '#fff', whiteSpace: 'pre-wrap' }}>
                {formData.completionReport}
              </p>
            </div>
          </div>
        )}

        {/* Rejection Reason (if rejected) */}
        {formData.rejectionReason && (
          <div className="form-section">
            <h2>Rejection Reason</h2>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <p style={{ margin: 0, color: '#ef4444', whiteSpace: 'pre-wrap' }}>
                {formData.rejectionReason}
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => router.push('/admin/tasks')}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Update Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
