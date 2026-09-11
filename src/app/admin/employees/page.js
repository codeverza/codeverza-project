'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './employees.css';

export const dynamic = 'force-dynamic';

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('All');

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, statusFilter, departmentFilter, employmentTypeFilter]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.employees);
        setFilteredEmployees(data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.cnic.includes(searchTerm) ||
        emp.contactNumber.includes(searchTerm) ||
        emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    // Department filter
    if (departmentFilter !== 'All') {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    // Employment type filter
    if (employmentTypeFilter !== 'All') {
      filtered = filtered.filter(emp => emp.employmentType === employmentTypeFilter);
    }

    setFilteredEmployees(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const response = await fetch(`/api/employees?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Employee deleted successfully');
        fetchEmployees();
      } else {
        alert(data.message || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
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

  const departments = [...new Set(employees.map(emp => emp.department))];
  const employmentTypes = [...new Set(employees.map(emp => emp.employmentType))];

  if (loading) {
    return null; // Global loader will handle this
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Employee Management</h1>
        <button
          className="create-btn"
          onClick={() => router.push('/admin/employees/create')}
        >
          + Add New Employee
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <p className="stat-number">{employees.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active</h3>
          <p className="stat-number stat-active">
            {employees.filter(e => e.status === 'Active').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>On Leave</h3>
          <p className="stat-number stat-warning">
            {employees.filter(e => e.status === 'Suspended').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Resigned/Terminated</h3>
          <p className="stat-number stat-danger">
            {employees.filter(e => e.status === 'Resigned' || e.status === 'Terminated').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by name, ID, CNIC, phone, or designation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Resigned">Resigned</option>
          <option value="Terminated">Terminated</option>
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          value={employmentTypeFilter}
          onChange={(e) => setEmploymentTypeFilter(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Types</option>
          {employmentTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <div className="results-info">
        Showing {filteredEmployees.length} of {employees.length} employees
      </div>

      {/* Employees Table */}
      <div className="employees-table-container">
        {filteredEmployees.length === 0 ? (
          <div className="no-data">
            <p>No employees found</p>
          </div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Employment Type</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.employeeId}</td>
                  <td>
                    {employee.photo ? (
                      <img
                        src={employee.photo}
                        alt={employee.name}
                        className="employee-photo"
                      />
                    ) : (
                      <div className="employee-photo-placeholder">
                        {employee.name.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td>
                    <strong>{employee.name}</strong>
                  </td>
                  <td>{employee.designation}</td>
                  <td>{employee.department}</td>
                  <td>
                    <div>{employee.contactNumber}</div>
                    <div style={{ fontSize: '0.85em', color: '#666' }}>
                      {employee.personalEmail}
                    </div>
                  </td>
                  <td>{employee.employmentType}</td>
                  <td>{new Date(employee.joiningDate).toLocaleDateString()}</td>
                  <td>
                    <span className={getStatusClass(employee.status)}>
                      {employee.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        onClick={() => router.push(`/admin/employees/view/${employee.id}`)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => router.push(`/admin/employees/edit/${employee.id}`)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(employee.id, employee.name)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button onClick={() => router.push('/admin/employees/attendance')}>
            📅 Mark Attendance
          </button>
          <button onClick={() => router.push('/admin/employees/leaves')}>
            📝 Leave Requests
          </button>
          <button onClick={() => router.push('/admin/employees/salary')}>
            💰 Salary Management
          </button>
          <button onClick={() => router.push('/admin/employees/projects')}>
            📊 Projects & Tasks
          </button>
          <button onClick={() => router.push('/admin/employees/sales')}>
            📈 Sales Tracking
          </button>
          <button onClick={() => router.push('/admin/employees/documents')}>
            📄 Documents
          </button>
          <button onClick={() => router.push('/admin/employees/performance')}>
            🎯 Performance
          </button>
          <button onClick={() => router.push('/admin/employees/permissions')}>
            🔐 Permissions
          </button>
        </div>
      </div>
    </div>
  );
}
