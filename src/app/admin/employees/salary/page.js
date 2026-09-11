'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '../employees.css';

export const dynamic = 'force-dynamic';

function SalaryManagementPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeFilter = searchParams.get('employee');

  const [salaryRecords, setSalaryRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: employeeFilter || '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    baseSalary: 0,
    projectAmount: 0,
    thirdPartyExpenses: 0,
    bonus: 0,
    incentives: 0,
    deductions: 0,
    penalties: 0,
    paymentStatus: 'Pending',
    paymentDate: '',
    paymentMethod: '',
    remarks: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchSalaryRecords();
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

  const fetchSalaryRecords = async () => {
    try {
      const url = employeeFilter 
        ? `/api/employees/salary?employeeId=${employeeFilter}`
        : '/api/employees/salary';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setSalaryRecords(data.records);
      }
    } catch (error) {
      console.error('Error fetching salary records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/employees/salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Salary record created successfully!');
        setShowForm(false);
        fetchSalaryRecords();
        resetForm();
      } else {
        alert(data.message || 'Failed to create salary record');
      }
    } catch (error) {
      console.error('Error creating salary record:', error);
      alert('Failed to create salary record');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: employeeFilter || '',
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      baseSalary: 0,
      projectAmount: 0,
      thirdPartyExpenses: 0,
      bonus: 0,
      incentives: 0,
      deductions: 0,
      penalties: 0,
      paymentStatus: 'Pending',
      paymentDate: '',
      paymentMethod: '',
      remarks: ''
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this salary record?')) return;

    try {
      const response = await fetch(`/api/employees/salary?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Salary record deleted successfully');
        fetchSalaryRecords();
      }
    } catch (error) {
      console.error('Error deleting salary record:', error);
      alert('Failed to delete salary record');
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'Paid':
        return 'status-badge status-active';
      case 'Pending':
        return 'status-badge status-suspended';
      case 'Partially Paid':
        return 'status-badge status-resigned';
      default:
        return 'status-badge';
    }
  };

  if (loading) {
    return null; // Global loader will handle this
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Salary & Commission Management</h1>
        <button className="create-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Generate Salary'}
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <form onSubmit={handleSubmit} className="salary-form">
            <h3>Generate Salary Record</h3>
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
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Month *</label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  required
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Year *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Base Salary (PKR)</label>
                <input
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Project Amount (PKR)</label>
                <input
                  type="number"
                  value={formData.projectAmount}
                  onChange={(e) => setFormData({ ...formData, projectAmount: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Third-Party Expenses (PKR)</label>
                <input
                  type="number"
                  value={formData.thirdPartyExpenses}
                  onChange={(e) => setFormData({ ...formData, thirdPartyExpenses: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Bonus (PKR)</label>
                <input
                  type="number"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Incentives (PKR)</label>
                <input
                  type="number"
                  value={formData.incentives}
                  onChange={(e) => setFormData({ ...formData, incentives: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Deductions (PKR)</label>
                <input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Penalties (PKR)</label>
                <input
                  type="number"
                  value={formData.penalties}
                  onChange={(e) => setFormData({ ...formData, penalties: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows="2"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Generate Salary
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="employees-table-container">
        {salaryRecords.length === 0 ? (
          <div className="no-data">
            <p>No salary records found</p>
          </div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month/Year</th>
                <th>Base Salary</th>
                <th>Commission</th>
                <th>Bonus</th>
                <th>Gross Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaryRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>{record.employeeName}</strong>
                    <div style={{ fontSize: '0.85em', color: '#666' }}>
                      {record.employeeIdNumber}
                    </div>
                  </td>
                  <td>{record.month} {record.year}</td>
                  <td>PKR {record.baseSalary?.toLocaleString()}</td>
                  <td>PKR {record.commission?.toLocaleString()}</td>
                  <td>PKR {record.bonus?.toLocaleString()}</td>
                  <td>
                    <strong>PKR {record.grossSalary?.toLocaleString()}</strong>
                  </td>
                  <td>PKR {record.totalDeductions?.toLocaleString()}</td>
                  <td>
                    <strong style={{ color: '#27ae60' }}>
                      PKR {record.netSalary?.toLocaleString()}
                    </strong>
                  </td>
                  <td>
                    <span className={getPaymentStatusClass(record.paymentStatus)}>
                      {record.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(record.id)}
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
    </div>
  );
}


export default function SalaryManagementPage() {
  return (
    <Suspense fallback={
      <div className="employees-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    }>
      <SalaryManagementPageContent />
    </Suspense>
  );
}
