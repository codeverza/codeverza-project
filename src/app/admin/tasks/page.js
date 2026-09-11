'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import '../employees/employees.css';

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.tasks);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Load Tasks',
          text: data.message,
          confirmButtonColor: '#b14cff',
          background: '#0d0d0d',
          color: '#fff'
        });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Tasks',
        text: 'Could not fetch tasks. Please try again.',
        confirmButtonColor: '#b14cff',
        background: '#0d0d0d',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedToName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const handleDelete = async (taskId, taskTitle) => {
    const result = await Swal.fire({
      title: 'Delete Task?',
      text: `Are you sure you want to delete "${taskTitle}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      background: '#0d0d0d',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/tasks?id=${taskId}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Task Deleted!',
            text: 'Task has been removed successfully',
            confirmButtonColor: '#b14cff',
            background: '#0d0d0d',
            color: '#fff',
            timer: 2000
          });
          fetchTasks();
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: error.message || 'Could not delete task',
          confirmButtonColor: '#b14cff',
          background: '#0d0d0d',
          color: '#fff'
        });
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'To Do': return 'status-todo';
      case 'In Progress': return 'status-in-progress';
      case 'Completed': return 'status-completed';
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Low': return 'priority-low';
      case 'Medium': return 'priority-medium';
      case 'High': return 'priority-high';
      case 'Urgent': return 'priority-urgent';
      default: return '';
    }
  };

  if (loading) {
    return null; // Global loader will handle this
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Task Management</h1>
        <button 
          className="create-btn"
          onClick={() => router.push('/admin/tasks/create')}
        >
          + Create New Task
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search by task, employee, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'rgba(177, 76, 255, 0.1)', borderColor: 'rgba(177, 76, 255, 0.3)' }}>
          <h3>Total Tasks</h3>
          <p className="stat-number">{tasks.length}</p>
        </div>
        <div className="stat-card" style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <h3>In Progress</h3>
          <p className="stat-number" style={{ color: '#3b82f6' }}>
            {tasks.filter(t => t.status === 'In Progress').length}
          </p>
        </div>
        <div className="stat-card" style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
          <h3>Pending Review</h3>
          <p className="stat-number" style={{ color: '#fbbf24' }}>
            {tasks.filter(t => t.status === 'Completed').length}
          </p>
        </div>
        <div className="stat-card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <h3>Approved</h3>
          <p className="stat-number" style={{ color: '#10b981' }}>
            {tasks.filter(t => t.status === 'Approved').length}
          </p>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="employees-table-container">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found</p>
            <button 
              className="create-btn"
              onClick={() => router.push('/admin/tasks/create')}
            >
              Create First Task
            </button>
          </div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Assigned To</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div style={{ maxWidth: '250px' }}>
                      <strong>{task.taskTitle}</strong>
                      {task.taskDescription && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#888', 
                          marginTop: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {task.taskDescription}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{task.assignedToName}</td>
                  <td>{task.projectName || 'N/A'}</td>
                  <td>
                    <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    {task.deadline ? new Date(task.deadline).toLocaleDateString('en-GB') : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress-bar-small">
                        <div 
                          className="progress-fill-small" 
                          style={{ width: `${task.progress || 0}%` }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#b14cff', fontWeight: '600' }}>
                        {task.progress || 0}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        onClick={() => router.push(`/admin/tasks/view/${task.id}`)}
                        title="View Details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => router.push(`/admin/tasks/edit/${task.id}`)}
                        title="Edit Task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(task.id, task.taskTitle)}
                        title="Delete Task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
