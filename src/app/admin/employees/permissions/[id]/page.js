'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import '../../employees.css';

export default function EmployeePermissionsPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [permissions, setPermissions] = useState({
    dashboard: { view: true },
    profile: { view: true, edit: false },
    attendance: { view: true, add: false, edit: false, delete: false },
    leaves: { view: true, add: true, edit: false, delete: false },
    salary: { view: true },
    projects: { view: true, add: false, edit: false },
    tasks: { view: true, add: false, edit: true, delete: false },
    documents: { view: true, add: false, edit: false, delete: false },
    sales: { view: false, add: false, edit: false, delete: false },
    reports: { view: false }
  });

  useEffect(() => {
    loadEmployeeData();
  }, [employeeId]);

  const loadEmployeeData = async () => {
    try {
      // Load employee details
      const empRes = await fetch(`/api/employees?id=${employeeId}`);
      const empData = await empRes.json();
      
      if (empData.success) {
        setEmployee(empData.employee);
      }

      // Load existing permissions
      const permRes = await fetch(`/api/employees/permissions?employeeId=${employeeId}`);
      const permData = await permRes.json();
      
      if (permData.success && permData.permissions) {
        setPermissions(permData.permissions);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load employee data');
      setLoading(false);
    }
  };

  const handlePermissionChange = (module, action, value) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Check if permissions exist
      const checkRes = await fetch(`/api/employees/permissions?employeeId=${employeeId}`);
      const checkData = await checkRes.json();

      let response;
      if (checkData.permissions) {
        // Update existing permissions
        response = await fetch('/api/employees/permissions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            ...permissions
          })
        });
      } else {
        // Create new permissions
        response = await fetch('/api/employees/permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            ...permissions
          })
        });
      }

      const data = await response.json();

      if (data.success) {
        alert('Permissions saved successfully!');
        router.push(`/admin/employees/view/${employeeId}`);
      } else {
        alert(data.message || 'Failed to save permissions');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return null; // Global loader will handle this
  }

  if (!employee) {
    return (
      <div className="employees-container">
        <div className="error-message">Employee not found</div>
      </div>
    );
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <div>
          <h1>Set Permissions: {employee.name}</h1>
          <p style={{ color: '#718096', marginTop: '5px' }}>
            Employee ID: {employee.employeeId} | {employee.designation}
          </p>
        </div>
        <button
          className="back-btn"
          onClick={() => router.push(`/admin/employees/view/${employeeId}`)}
        >
          ← Back
        </button>
      </div>

      <div className="permissions-form">
        {/* Dashboard Permissions */}
        <div className="permission-section">
          <h2>📊 Dashboard</h2>
          <div className="permission-grid">
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.dashboard?.view}
                onChange={(e) => handlePermissionChange('dashboard', 'view', e.target.checked)}
              />
              <span>View Dashboard</span>
            </label>
          </div>
        </div>

        {/* Profile Permissions */}
        <div className="permission-section">
          <h2>👤 Profile</h2>
          <div className="permission-grid">
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.profile?.view}
                onChange={(e) => handlePermissionChange('profile', 'view', e.target.checked)}
              />
              <span>View Profile</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.profile?.edit}
                onChange={(e) => handlePermissionChange('profile', 'edit', e.target.checked)}
              />
              <span>Edit Profile</span>
            </label>
          </div>
        </div>

        {/* Attendance Permissions */}
        <div className="permission-section">
          <h2>📅 Attendance</h2>
          <div className="permission-grid">
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.attendance?.view}
                onChange={(e) => handlePermissionChange('attendance', 'view', e.target.checked)}
              />
              <span>View Attendance</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.attendance?.add}
                onChange={(e) => handlePermissionChange('attendance', 'add', e.target.checked)}
              />
              <span>Mark Attendance</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.attendance?.edit}
                onChange={(e) => handlePermissionChange('attendance', 'edit', e.target.checked)}
              />
              <span>Edit Attendance</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.attendance?.delete}
                onChange={(e) => handlePermissionChange('attendance', 'delete', e.target.checked)}
              />
              <span>Delete Attendance</span>
            </label>
          </div>
        </div>

        {/* Leaves Permissions */}
        <div className="permission-section">
          <h2>🏖️ Leaves</h2>
          <div className="permission-grid">
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.leaves?.view}
                onChange={(e) => handlePermissionChange('leaves', 'view', e.target.checked)}
              />
              <span>View Leaves</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.leaves?.add}
                onChange={(e) => handlePermissionChange('leaves', 'add', e.target.checked)}
              />
              <span>Apply Leave</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.leaves?.edit}
                onChange={(e) => handlePermissionChange('leaves', 'edit', e.target.checked)}
              />
              <span>Edit Leave</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.leaves?.delete}
                onChange={(e) => handlePermissionChange('leaves', 'delete', e.target.checked)}
              />
              <span>Delete Leave</span>
            </label>
          </div>
        </div>

        {/* Salary Permissions */}
        <div className="permission-section">
          <h2>💰 Salary</h2>
          <div className="permission-grid">
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.salary?.view}
                onChange={(e) => handlePermissionChange('salary', 'view', e.target.checked)}
              />
              <span>View Salary</span>
            </label>
          </div>
        </div>

        {/* Projects Permissions */}
        <div className="permission-section">
          <h2>📁 Projects</h2>
          <div className="permission-grid">
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.projects?.view}
                onChange={(e) => handlePermissionChange('projects', 'view', e.target.checked)}
              />
              <span>View Projects</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.projects?.add}
                onChange={(e) => handlePermissionChange('projects', 'add', e.target.checked)}
              />
              <span>Add Projects</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.projects?.edit}
                onChange={(e) => handlePermissionChange('projects', 'edit', e.target.checked)}
              />
              <span>Edit Projects</span>
            </label>
          </div>
        </div>

        {/* Tasks Permissions */}
        <div className="permission-section">
          <h2>✅ Tasks</h2>
          <div className="permission-grid">
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.tasks?.view}
                onChange={(e) => handlePermissionChange('tasks', 'view', e.target.checked)}
              />
              <span>View Tasks</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.tasks?.add}
                onChange={(e) => handlePermissionChange('tasks', 'add', e.target.checked)}
              />
              <span>Add Tasks</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.tasks?.edit}
                onChange={(e) => handlePermissionChange('tasks', 'edit', e.target.checked)}
              />
              <span>Edit Tasks</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.tasks?.delete}
                onChange={(e) => handlePermissionChange('tasks', 'delete', e.target.checked)}
              />
              <span>Delete Tasks</span>
            </label>
          </div>
        </div>

        {/* Documents Permissions */}
        <div className="permission-section">
          <h2>📄 Documents</h2>
          <div className="permission-grid">
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.documents?.view}
                onChange={(e) => handlePermissionChange('documents', 'view', e.target.checked)}
              />
              <span>View Documents</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.documents?.add}
                onChange={(e) => handlePermissionChange('documents', 'add', e.target.checked)}
              />
              <span>Upload Documents</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.documents?.edit}
                onChange={(e) => handlePermissionChange('documents', 'edit', e.target.checked)}
              />
              <span>Edit Documents</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.documents?.delete}
                onChange={(e) => handlePermissionChange('documents', 'delete', e.target.checked)}
              />
              <span>Delete Documents</span>
            </label>
          </div>
        </div>

        {/* Sales Permissions */}
        <div className="permission-section">
          <h2>💼 Sales</h2>
          <div className="permission-grid">
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.sales?.view}
                onChange={(e) => handlePermissionChange('sales', 'view', e.target.checked)}
              />
              <span>View Sales</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.sales?.add}
                onChange={(e) => handlePermissionChange('sales', 'add', e.target.checked)}
              />
              <span>Add Leads</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.sales?.edit}
                onChange={(e) => handlePermissionChange('sales', 'edit', e.target.checked)}
              />
              <span>Edit Leads</span>
            </label>
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.sales?.delete}
                onChange={(e) => handlePermissionChange('sales', 'delete', e.target.checked)}
              />
              <span>Delete Leads</span>
            </label>
          </div>
        </div>

        {/* Reports Permissions */}
        <div className="permission-section">
          <h2>📊 Reports</h2>
          <div className="permission-grid">
            <label className="permission-item">
              <input
                type="checkbox"
                checked={permissions.reports?.view}
                onChange={(e) => handlePermissionChange('reports', 'view', e.target.checked)}
              />
              <span>View Reports</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions" style={{ marginTop: '30px' }}>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => router.push(`/admin/employees/view/${employeeId}`)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="submit-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .permissions-form {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .permission-section {
          margin-bottom: 30px;
          padding-bottom: 30px;
          border-bottom: 2px solid #e2e8f0;
        }

        .permission-section:last-of-type {
          border-bottom: none;
        }

        .permission-section h2 {
          font-size: 18px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 15px;
        }

        .permission-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }

        .permission-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f7fafc;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .permission-item:hover {
          background: #edf2f7;
        }

        .permission-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .permission-item span {
          font-size: 14px;
          color: #4a5568;
          font-weight: 500;
        }

        .loading-state {
          text-align: center;
          padding: 60px;
          font-size: 16px;
          color: #718096;
        }

        .error-message {
          text-align: center;
          padding: 60px;
          font-size: 16px;
          color: #e53e3e;
        }

        @media (max-width: 768px) {
          .permission-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
