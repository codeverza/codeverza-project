'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import '../../../employees/employees.css';

export default function ViewTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id;
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`);
      const data = await response.json();

      if (data.success) {
        setTask(data.task);
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

  const handleApprove = async () => {
    const result = await Swal.fire({
      title: 'Approve Task?',
      text: 'Are you sure you want to approve this task?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      background: '#0d0d0d',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: taskId,
            status: 'Approved',
            approvedBy: 'Admin'
          })
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Task Approved! ✅',
            html: `
              <div style="text-align: center;">
                <p style="font-size: 16px; color: #fff; margin: 20px 0;">
                  Task has been approved successfully
                </p>
              </div>
            `,
            confirmButtonText: 'OK',
            confirmButtonColor: '#b14cff',
            background: '#0d0d0d',
            color: '#fff',
            timer: 2000,
            timerProgressBar: true
          }).then(() => {
            fetchTask(); // Refresh task data
          });
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Approval Failed',
          text: error.message || 'Could not approve task',
          confirmButtonColor: '#b14cff',
          background: '#0d0d0d',
          color: '#fff'
        });
      }
    }
  };

  const handleReject = async () => {
    const result = await Swal.fire({
      title: 'Reject Task',
      html: `
        <div style="text-align: left; margin-top: 20px;">
          <label style="color: #fff; font-size: 14px; font-weight: 600; margin-bottom: 8px; display: block;">
            Rejection Reason *
          </label>
          <textarea 
            id="rejection-reason" 
            placeholder="Please explain why this task is being rejected..."
            style="
              width: 100%;
              min-height: 120px;
              padding: 12px;
              background: rgba(0, 0, 0, 0.5);
              border: 1px solid rgba(177, 76, 255, 0.3);
              border-radius: 8px;
              color: #fff;
              font-size: 14px;
              font-family: inherit;
              resize: vertical;
            "
          ></textarea>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reject Task',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      background: '#0d0d0d',
      color: '#fff',
      preConfirm: () => {
        const reason = document.getElementById('rejection-reason').value;
        if (!reason || reason.trim() === '') {
          Swal.showValidationMessage('Please enter a rejection reason');
          return false;
        }
        return reason;
      }
    });

    if (result.isConfirmed && result.value) {
      try {
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: taskId,
            status: 'Rejected',
            rejectionReason: result.value
          })
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: 'info',
            title: 'Task Rejected',
            html: `
              <div style="text-align: center;">
                <p style="font-size: 16px; color: #fff; margin: 20px 0;">
                  Task has been rejected. Employee will be notified.
                </p>
              </div>
            `,
            confirmButtonText: 'OK',
            confirmButtonColor: '#b14cff',
            background: '#0d0d0d',
            color: '#fff',
            timer: 2000,
            timerProgressBar: true
          }).then(() => {
            fetchTask(); // Refresh task data
          });
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Rejection Failed',
          text: error.message || 'Could not reject task',
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

  if (!task) {
    return null;
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Task Details</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="back-btn"
            onClick={() => router.push('/admin/tasks')}
          >
            ← Back to Tasks
          </button>
          {task.status !== 'Approved' && task.status !== 'Rejected' && (
            <button
              className="edit-btn"
              onClick={() => router.push(`/admin/tasks/edit/${taskId}`)}
            >
              Edit Task
            </button>
          )}
        </div>
      </div>

      {/* Task Header */}
      <div className="form-section">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '28px', color: '#fff' }}>
              {task.taskTitle}
            </h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                {task.status}
              </span>
              <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                {task.priority} Priority
              </span>
            </div>
          </div>

          {/* Approve/Reject Buttons (only for completed tasks) */}
          {task.status === 'Completed' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleApprove}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                ✓ Approve Task
              </button>
              <button
                onClick={handleReject}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                ✕ Reject Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Details */}
      <div className="form-section">
        <h2>Task Information</h2>
        <div className="form-grid">
          <div className="info-field">
            <label>Assigned To</label>
            <p>{task.assignedToName}</p>
          </div>
          <div className="info-field">
            <label>Project</label>
            <p>{task.projectName || 'No Project Linked'}</p>
          </div>
          <div className="info-field">
            <label>Deadline</label>
            <p>{task.deadline ? new Date(task.deadline).toLocaleDateString('en-GB') : 'N/A'}</p>
          </div>
          <div className="info-field">
            <label>Progress</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="progress-bar-small" style={{ width: '150px', height: '8px' }}>
                <div 
                  className="progress-fill-small" 
                  style={{ width: `${task.progress || 0}%` }}
                ></div>
              </div>
              <span style={{ fontSize: '14px', color: '#b14cff', fontWeight: '600' }}>
                {task.progress || 0}%
              </span>
            </div>
          </div>
        </div>

        {task.taskDescription && (
          <div style={{ marginTop: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#888', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Description
            </label>
            <p style={{ 
              margin: 0, 
              color: '#fff', 
              fontSize: '15px', 
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {task.taskDescription}
            </p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="form-section">
        <h2>Timeline</h2>
        <div className="form-grid">
          <div className="info-field">
            <label>Created At</label>
            <p>{task.createdAt ? new Date(task.createdAt.seconds * 1000).toLocaleString('en-GB') : 'N/A'}</p>
          </div>
          {task.completedAt && (
            <div className="info-field">
              <label>Completed At</label>
              <p>{new Date(task.completedAt.seconds * 1000).toLocaleString('en-GB')}</p>
            </div>
          )}
          {task.approvedAt && (
            <div className="info-field">
              <label>Approved At</label>
              <p>{new Date(task.approvedAt.seconds * 1000).toLocaleString('en-GB')}</p>
            </div>
          )}
          <div className="info-field">
            <label>Last Updated</label>
            <p>{task.updatedAt ? new Date(task.updatedAt.seconds * 1000).toLocaleString('en-GB') : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Completion Report */}
      {task.completionReport && (
        <div className="form-section">
          <h2>Completion Report</h2>
          <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '2px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <p style={{ 
              margin: 0, 
              color: '#fff', 
              fontSize: '15px', 
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap'
            }}>
              {task.completionReport}
            </p>
          </div>
        </div>
      )}

      {/* Rejection Reason */}
      {task.rejectionReason && (
        <div className="form-section">
          <h2>Rejection Reason</h2>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <p style={{ 
              margin: 0, 
              color: '#ef4444', 
              fontSize: '15px', 
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap'
            }}>
              {task.rejectionReason}
            </p>
          </div>
        </div>
      )}

      {/* Approval Info */}
      {task.status === 'Approved' && task.approvedBy && (
        <div className="form-section">
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#10b981', fontSize: '18px' }}>
              ✓ Task Approved
            </h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Approved by {task.approvedBy} on {new Date(task.approvedAt.seconds * 1000).toLocaleString('en-GB')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
