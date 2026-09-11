'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../employees.css';

export const dynamic = 'force-dynamic';

export default function ProjectsTasksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const [projectForm, setProjectForm] = useState({
    projectName: '',
    description: '',
    clientName: '',
    assignedEmployees: [],
    startDate: '',
    deadline: '',
    status: 'Active',
    priority: 'Medium',
    projectValue: 0
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    projectId: '',
    status: 'To Do',
    priority: 'Medium',
    deadline: '',
    estimatedHours: 0
  });

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
    fetchTasks();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees?status=Active');
      const data = await response.json();
      if (data.success) {
        setEmployees(data.employees);
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
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/employees/tasks');
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/employees/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm)
      });

      const data = await response.json();
      if (data.success) {
        alert('Project created successfully!');
        setShowProjectForm(false);
        fetchProjects();
        resetProjectForm();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/employees/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm)
      });

      const data = await response.json();
      if (data.success) {
        alert('Task created successfully!');
        setShowTaskForm(false);
        fetchTasks();
        resetTaskForm();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      const response = await fetch('/api/employees/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const resetProjectForm = () => {
    setProjectForm({
      projectName: '',
      description: '',
      clientName: '',
      assignedEmployees: [],
      startDate: '',
      deadline: '',
      status: 'Active',
      priority: 'Medium',
      projectValue: 0
    });
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      assignedTo: '',
      projectId: '',
      status: 'To Do',
      priority: 'Medium',
      deadline: '',
      estimatedHours: 0
    });
  };

  const handleEmployeeSelection = (empId) => {
    const currentSelection = projectForm.assignedEmployees;
    if (currentSelection.includes(empId)) {
      setProjectForm({
        ...projectForm,
        assignedEmployees: currentSelection.filter(id => id !== empId)
      });
    } else {
      setProjectForm({
        ...projectForm,
        assignedEmployees: [...currentSelection, empId]
      });
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Active': 'status-active',
      'In Progress': 'status-active',
      'To Do': 'status-suspended',
      'Review': 'status-resigned',
      'Completed': 'status-active',
      'On Hold': 'status-suspended',
      'Cancelled': 'status-terminated'
    };
    return `status-badge ${statusMap[status] || ''}`;
  };

  const getPriorityClass = (priority) => {
    const priorityMap = {
      'Low': 'status-badge',
      'Medium': 'status-badge status-suspended',
      'High': 'status-badge status-resigned',
      'Urgent': 'status-badge status-terminated'
    };
    return priorityMap[priority] || 'status-badge';
  };

  if (loading) {
    return null; // Global loader will handle this
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Projects & Tasks Management</h1>
        <div className="header-actions">
          {activeTab === 'projects' ? (
            <button className="create-btn" onClick={() => setShowProjectForm(!showProjectForm)}>
              {showProjectForm ? '✕ Cancel' : '+ Add Project'}
            </button>
          ) : (
            <button className="create-btn" onClick={() => setShowTaskForm(!showTaskForm)}>
              {showTaskForm ? '✕ Cancel' : '+ Add Task'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={activeTab === 'projects' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('projects')}
          >
            📊 Projects ({projects.length})
          </button>
          <button
            className={activeTab === 'tasks' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('tasks')}
          >
            📋 Tasks ({tasks.length})
          </button>
        </div>
      </div>

      {/* Project Form */}
      {showProjectForm && activeTab === 'projects' && (
        <div className="form-modal">
          <form onSubmit={handleProjectSubmit} className="project-form">
            <h3>Create New Project</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={projectForm.projectName}
                  onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Client Name</label>
                <input
                  type="text"
                  value={projectForm.clientName}
                  onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={projectForm.deadline}
                  onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={projectForm.priority}
                  onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Project Value (PKR)</label>
                <input
                  type="number"
                  value={projectForm.projectValue}
                  onChange={(e) => setProjectForm({ ...projectForm, projectValue: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group full-width">
                <label>Assign Employees *</label>
                <div className="employee-selection">
                  {employees.map(emp => (
                    <label key={emp.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={projectForm.assignedEmployees.includes(emp.id)}
                        onChange={() => handleEmployeeSelection(emp.id)}
                      />
                      {emp.name} ({emp.employeeId})
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowProjectForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task Form */}
      {showTaskForm && activeTab === 'tasks' && (
        <div className="form-modal">
          <form onSubmit={handleTaskSubmit} className="task-form">
            <h3>Create New Task</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Assign To *</label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Project (Optional)</label>
                <select
                  value={taskForm.projectId}
                  onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                >
                  <option value="">No Project</option>
                  {projects.map(proj => (
                    <option key={proj.id} value={proj.id}>
                      {proj.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Estimated Hours</label>
                <input
                  type="number"
                  value={taskForm.estimatedHours}
                  onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: parseFloat(e.target.value) })}
                  min="0"
                  step="0.5"
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowTaskForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Tab Content */}
      {activeTab === 'projects' && (
        <div className="employees-table-container">
          {projects.length === 0 ? (
            <div className="no-data"><p>No projects found</p></div>
          ) : (
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Client</th>
                  <th>Assigned Employees</th>
                  <th>Deadline</th>
                  <th>Value</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td><strong>{project.projectName}</strong></td>
                    <td>{project.clientName || 'N/A'}</td>
                    <td>
                      {project.employeeDetails?.map(emp => emp.name).join(', ') || 'None'}
                    </td>
                    <td>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</td>
                    <td>PKR {project.projectValue?.toLocaleString() || 0}</td>
                    <td><span className={getPriorityClass(project.priority)}>{project.priority}</span></td>
                    <td><span className={getStatusClass(project.status)}>{project.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tasks Tab Content */}
      {activeTab === 'tasks' && (
        <div className="employees-table-container">
          {tasks.length === 0 ? (
            <div className="no-data"><p>No tasks found</p></div>
          ) : (
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Project</th>
                  <th>Deadline</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td><strong>{task.title}</strong></td>
                    <td>{task.assignedToName}</td>
                    <td>{task.projectName || 'No Project'}</td>
                    <td>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</td>
                    <td><span className={getPriorityClass(task.priority)}>{task.priority}</span></td>
                    <td>
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusUpdate(task.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td>
                      <span className={getStatusClass(task.status)}>{task.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
