'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import '../../employees.css';

export const dynamic = 'force-dynamic';

export default function ViewEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id;

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees?id=${employeeId}`);
      const data = await response.json();

      if (data.success) {
        setEmployee(data.employee);
      } else {
        alert('Employee not found');
        router.push('/admin/employees');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      alert('Failed to fetch employee');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Active':
        return 'status-badge status-active';
      case 'Suspended':
        return 'status-badge status-suspended';
      case 'Resigned':
        return 'status-badge status-resigned';
      case 'Terminated':
        return 'status-badge status-terminated';
      default:
        return 'status-badge';
    }
  };

  if (loading) {
    return null; // Global loader will handle this
  }

  if (!employee) {
    return null;
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Employee Profile</h1>
        <div className="header-actions">
          <button
            className="edit-btn"
            onClick={() => router.push(`/admin/employees/edit/${employeeId}`)}
          >
            ✏️ Edit
          </button>
          <button
            className="back-btn"
            onClick={() => router.push('/admin/employees')}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Employee Header Card */}
      <div className="employee-header-card">
        <div className="employee-photo-section">
          {employee.photo ? (
            <img src={employee.photo} alt={employee.name} className="employee-photo-large" />
          ) : (
            <div className="employee-photo-placeholder-large">
              {employee.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="employee-header-info">
          <h2>{employee.name}</h2>
          <p className="employee-id">ID: {employee.employeeId}</p>
          <p className="employee-designation">{employee.designation} - {employee.department}</p>
          <span className={getStatusClass(employee.status)}>
            {employee.status}
          </span>
        </div>
        <div className="employee-quick-stats">
          <div className="quick-stat">
            <span className="stat-label">Employment Type</span>
            <span className="stat-value">{employee.employmentType}</span>
          </div>
          <div className="quick-stat">
            <span className="stat-label">Joining Date</span>
            <span className="stat-value">
              {new Date(employee.joiningDate).toLocaleDateString()}
            </span>
          </div>
          <div className="quick-stat">
            <span className="stat-label">Role</span>
            <span className="stat-value">{employee.role || 'Employee'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={activeTab === 'profile' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button
            className={activeTab === 'salary' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('salary')}
          >
            💰 Salary
          </button>
          <button
            className={activeTab === 'leaves' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('leaves')}
          >
            📝 Leaves
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'profile' && (
          <>
            {/* Personal Information */}
            <div className="info-section">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{employee.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">CNIC</span>
                  <span className="info-value">{employee.cnic}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Contact Number</span>
                  <span className="info-value">{employee.contactNumber}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Personal Email</span>
                  <span className="info-value">{employee.personalEmail}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Company Email</span>
                  <span className="info-value">{employee.companyEmail || 'N/A'}</span>
                </div>
                <div className="info-item full-width">
                  <span className="info-label">Address</span>
                  <span className="info-value">{employee.address || 'N/A'}</span>
                </div>
                <div className="info-item full-width">
                  <span className="info-label">Emergency Contact</span>
                  <span className="info-value">{employee.emergencyContact || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="info-section">
              <h3>Employment Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Employee ID</span>
                  <span className="info-value">{employee.employeeId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Designation</span>
                  <span className="info-value">{employee.designation}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">{employee.department}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Employment Type</span>
                  <span className="info-value">{employee.employmentType}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Joining Date</span>
                  <span className="info-value">
                    {new Date(employee.joiningDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Reporting Manager</span>
                  <span className="info-value">{employee.reportingManager || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className={getStatusClass(employee.status)}>
                    {employee.status}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Role</span>
                  <span className="info-value">{employee.role || 'Employee'}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'salary' && (
          <div className="info-section">
            <h3>Salary & Commission Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Monthly Salary</span>
                <span className="info-value">PKR {employee.monthlySalary?.toLocaleString() || 0}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Salary Type</span>
                <span className="info-value">{employee.salaryType || 'Fixed'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Commission %</span>
                <span className="info-value">{employee.commissionPercentage || 0}%</span>
              </div>
              <div className="info-item">
                <span className="info-label">Exclude Third-Party Expenses</span>
                <span className="info-value">
                  {employee.excludeThirdPartyExpenses ? 'Yes' : 'No'}
                </span>
              </div>
              {employee.isSalesEmployee && (
                <div className="info-item">
                  <span className="info-label">Monthly Sales Target</span>
                  <span className="info-value">
                    PKR {employee.monthlySalesTarget?.toLocaleString() || 0}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="info-section">
            <h3>Leave Balance</h3>
            <div className="leave-balance-grid">
              <div className="leave-card">
                <div className="leave-type">Casual Leaves</div>
                <div className="leave-count">{employee.casualLeaves || 0}</div>
                <div className="leave-label">Available</div>
              </div>
              <div className="leave-card">
                <div className="leave-type">Sick Leaves</div>
                <div className="leave-count">{employee.sickLeaves || 0}</div>
                <div className="leave-label">Available</div>
              </div>
              <div className="leave-card">
                <div className="leave-type">Annual Leaves</div>
                <div className="leave-count">{employee.annualLeaves || 0}</div>
                <div className="leave-label">Available</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button onClick={() => router.push(`/admin/employees/attendance?employee=${employeeId}`)}>
            📅 View Attendance
          </button>
          <button onClick={() => router.push(`/admin/employees/leaves?employee=${employeeId}`)}>
            📝 Leave History
          </button>
          <button onClick={() => router.push(`/admin/employees/salary?employee=${employeeId}`)}>
            💰 Salary Records
          </button>
          <button onClick={() => router.push(`/admin/employees/tasks?employee=${employeeId}`)}>
            📋 Assigned Tasks
          </button>
          <button onClick={() => router.push(`/admin/employees/documents?employee=${employeeId}`)}>
            📄 Documents
          </button>
          <button onClick={() => router.push(`/admin/employees/performance?employee=${employeeId}`)}>
            🎯 Performance
          </button>
        </div>
      </div>
    </div>
  );
}
