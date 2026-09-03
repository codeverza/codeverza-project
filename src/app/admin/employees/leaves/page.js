'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '../employees.css';

export default function LeavesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeFilter = searchParams.get('employee');

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: employeeFilter || '',
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchLeaves();
  }, [employeeFilter]);

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

  const fetchLeaves = async () => {
    try {
      const url = employeeFilter 
        ? `/api/employees/leaves?employeeId=${employeeFilter}`
        : '/api/employees/leaves';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setLeaveRequests(data.leaves);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/employees/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Leave request submitted successfully!');
        setShowForm(false);
        fetchLeaves();
        resetForm();
      } else {
        alert(data.message || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Failed to submit leave request');
    }
  };

  const handleApprove = async (id) => {
    try {
      const approvedBy = prompt('Enter approver name:');
      if (!approvedBy) return;

      const response = await fetch('/api/employees/leaves', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          status: 'Approved',
          approvedBy 
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Leave request approved!');
        fetchLeaves();
      } else {
        alert(data.message || 'Failed to approve leave');
      }
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    try {
      const rejectionReason = prompt('Enter rejection reason:');
      if (!rejectionReason) return;

      const response = await fetch('/api/employees/leaves', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          status: 'Rejected',
          rejectionReason 
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Leave request rejected!');
        fetchLeaves();
      } else {
        alert(data.message || 'Failed to reject leave');
      }
    } catch (error) {
      console.error('Error rejecting leave:', error);
      alert('Failed to reject leave');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: employeeFilter || '',
      leaveType: 'Casual',
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'status-badge status-active';
      case 'Pending':
        return 'status-badge status-suspended';
      case 'Rejected':
        return 'status-badge status-terminated';
      default:
        return 'status-badge';
    }
  };

  if (loading) {
    return (
      <div className="employees-container">
        <div className="loading-spinner">Loading leave requests...</div>
      </div>
    );
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Leave Management</h1>
        <button className="create-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Apply for Leave'}
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Requests</h3>
          <p className="stat-number">{leaveRequests.length}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number stat-warning">
            {leaveRequests.filter(l => l.status === 'Pending').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Approved</h3>
          <p className="stat-number stat-active">
            {leaveRequests.filter(l => l.status === 'Approved').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Rejected</h3>
          <p className="stat-number stat-danger">
            {leaveRequests.filter(l => l.status === 'Rejected').length}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="form-modal">
          <form onSubmit={handleSubmit} className="leave-form">
            <h3>Apply for Leave</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Employee *</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employeeId}) - C:{emp.casualLeaves} S:{emp.sickLeaves} A:{emp.annualLeaves}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Leave Type *</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  required
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Annual">Annual Leave</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Reason *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows="3"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Submit Leave Request
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="quotations-table-container">
        {leaveRequests.length === 0 ? (
          <div className="no-data">
            <p>No leave requests found</p>
          </div>
        ) : (
          <table className="quotations-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Applied Date</th>
                <th>Available Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((leave) => (
                <tr key={leave.id}>
                  <td>
                    <strong>{leave.employeeName}</strong>
                    <div style={{ fontSize: '0.85em', color: '#666' }}>
                      {leave.employeeIdNumber}
                    </div>
                  </td>
                  <td>{leave.leaveType}</td>
                  <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                  <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                  <td><strong>{leave.numberOfDays}</strong></td>
                  <td>{leave.reason}</td>
                  <td>{new Date(leave.appliedDate).toLocaleDateString()}</td>
                  <td>{leave.availableBalance}</td>
                  <td>
                    <span className={getStatusClass(leave.status)}>
                      {leave.status}
                    </span>
                    {leave.status === 'Approved' && leave.approvedBy && (
                      <div style={{ fontSize: '0.75em', color: '#666' }}>
                        by {leave.approvedBy}
                      </div>
                    )}
                    {leave.status === 'Rejected' && leave.rejectionReason && (
                      <div style={{ fontSize: '0.75em', color: '#e74c3c' }}>
                        {leave.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>
                    {leave.status === 'Pending' && (
                      <div className="action-buttons">
                        <button
                          className="view-btn"
                          onClick={() => handleApprove(leave.id)}
                          title="Approve"
                        >
                          ✓
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleReject(leave.id)}
                          title="Reject"
                        >
                          ✕
                        </button>
                      </div>
                    )}
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
