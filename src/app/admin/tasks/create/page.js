'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import '../../employees/employees.css';

export default function CreateTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    taskTitle: '',
    taskDescription: '',
    assignedTo: '',
    assignedToName: '',
    priority: 'Medium',
    deadline: '',
    projectId: '',
    projectName: '',
    createdBy: 'Admin'
  });

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      if (data.success) {
        // Filter only active employees with login enabled
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
    
    // If employee is selected, also set employee name
    if (name === 'assignedTo') {
      const selectedEmployee = employees.find(emp => emp.id === value);
      setFormData(prev => ({
        ...prev,
        assignedTo: value,
        assignedToName: selectedEmployee ? selectedEmployee.name : ''
      }));
    }
    // If project is selected, also set project name
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
    
    // Validation
    if (!formData.taskTitle.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Task Title Required',
        text: 'Please enter a task title',
        confirmButtonColor: '#b14cff',
        background: '#0d0d0d',
        color: '#fff'
      });
      return;
    }

    if (!formData.assignedTo) {
      Swal.fire({
        icon: 'error',
        title: 'Employee Required',
        text: 'Please select an employee to assign this task',
        confirmButtonColor: '#b14cff',
        background: '#0d0d0d',
        color: '#fff'
      });
      return;
    }

    if (!formData.deadline) {
      Swal.fire({
        icon: 'error',
        title: 'Deadline Required',
        text: 'Please set a deadline for this task',
        confirmButtonColor: '#b14cff',
        background: '#0d0d0d',
        color: '#fff'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Task Created Successfully! ✅',
          html: `
            <div style="text-align: center;">
              <p style="font-size: 16px; color: #fff; margin: 20px 0;">
                Task has been assigned to <strong>${formData.assignedToName}</strong>
              </p>
            </div>
          `,
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
      console.error('Error creating task:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Create Task',
        text: error.message || 'Something went wrong. Please try again.',
        confirmButtonColor: '#b14cff',
        background: '#0d0d0d',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Create New Task</h1>
        <button
          className="back-btn"
          onClick={() => router.push('/admin/tasks')}
        >
          ← Back to Tasks
        </button>
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
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
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Task Description</label>
              <textarea
                name="taskDescription"
                value={formData.taskDescription}
                onChange={handleChange}
                placeholder="Describe the task in detail..."
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
                value={formData.projectId}
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
              <small style={{ color: '#888', marginTop: '5px', display: 'block' }}>
                Urgent tasks will be highlighted for the employee
              </small>
            </div>

            <div className="form-group">
              <label>Deadline *</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        {formData.taskTitle && formData.assignedToName && (
          <div className="form-section">
            <h2>Task Preview</h2>
            <div style={{
              background: 'rgba(177, 76, 255, 0.1)',
              border: '1px solid rgba(177, 76, 255, 0.3)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>{formData.taskTitle}</h3>
              {formData.taskDescription && (
                <p style={{ margin: '0 0 15px 0', color: '#888', fontSize: '14px' }}>
                  {formData.taskDescription}
                </p>
              )}
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <span className="badge priority-medium">
                  Assigned to: {formData.assignedToName}
                </span>
                <span className={`badge priority-${formData.priority.toLowerCase()}`}>
                  {formData.priority} Priority
                </span>
                {formData.deadline && (
                  <span className="badge status-todo">
                    Due: {new Date(formData.deadline).toLocaleDateString('en-GB')}
                  </span>
                )}
                {formData.projectName && (
                  <span className="badge status-in-progress">
                    Project: {formData.projectName}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => router.push('/admin/tasks')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Task...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
