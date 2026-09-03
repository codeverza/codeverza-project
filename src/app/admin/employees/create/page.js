'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../employees.css';

export default function CreateEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    cnic: '',
    contactNumber: '',
    personalEmail: '',
    companyEmail: '',
    address: '',
    emergencyContact: '',
    designation: '',
    department: '',
    joiningDate: '',
    employmentType: 'Full-time',
    reportingManager: '',
    monthlySalary: 0,
    salaryType: 'Fixed',
    commissionPercentage: 0,
    excludeThirdPartyExpenses: true,
    casualLeaves: 12,
    sickLeaves: 10,
    annualLeaves: 15,
    role: 'Employee',
    isSalesEmployee: false,
    monthlySalesTarget: 0
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(`Employee created successfully! Employee ID: ${data.generatedEmployeeId}`);
        router.push('/admin/employees');
      } else {
        alert(data.message || 'Failed to create employee');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      alert('Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Add New Employee</h1>
        <button
          className="back-btn"
          onClick={() => router.push('/admin/employees')}
        >
          ← Back to Employees
        </button>
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
        {/* Personal Information */}
        <div className="form-section">
          <h2>Personal Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>CNIC *</label>
              <input
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                placeholder="12345-1234567-1"
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Number *</label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Personal Email *</label>
              <input
                type="email"
                name="personalEmail"
                value={formData.personalEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Company Email</label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Photo URL</label>
              <input
                type="url"
                name="photo"
                value={formData.photo}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
              />
            </div>

            <div className="form-group full-width">
              <label>Emergency Contact</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Name: John Doe, Phone: 0300-1234567"
              />
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="form-section">
          <h2>Employment Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Designation *</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Department *</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Joining Date *</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Employment Type *</label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Intern">Intern</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="form-group">
              <label>Reporting Manager</label>
              <input
                type="text"
                name="reportingManager"
                value={formData.reportingManager}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Salary Information */}
        <div className="form-section">
          <h2>Salary & Commission</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Monthly Salary (PKR)</label>
              <input
                type="number"
                name="monthlySalary"
                value={formData.monthlySalary}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Salary Type</label>
              <select
                name="salaryType"
                value={formData.salaryType}
                onChange={handleChange}
              >
                <option value="Fixed">Fixed Salary</option>
                <option value="Commission">Commission Only</option>
                <option value="Salary+Commission">Salary + Commission</option>
              </select>
            </div>

            <div className="form-group">
              <label>Commission Percentage (%)</label>
              <input
                type="number"
                name="commissionPercentage"
                value={formData.commissionPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.5"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="excludeThirdPartyExpenses"
                  checked={formData.excludeThirdPartyExpenses}
                  onChange={handleChange}
                />
                {' '}Exclude Third-Party Expenses from Commission
              </label>
            </div>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="form-section">
          <h2>Leave Balance</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Casual Leaves</label>
              <input
                type="number"
                name="casualLeaves"
                value={formData.casualLeaves}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Sick Leaves</label>
              <input
                type="number"
                name="sickLeaves"
                value={formData.sickLeaves}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Annual Leaves</label>
              <input
                type="number"
                name="annualLeaves"
                value={formData.annualLeaves}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Sales Employee Settings */}
        <div className="form-section">
          <h2>Sales Settings</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="isSalesEmployee"
                  checked={formData.isSalesEmployee}
                  onChange={handleChange}
                />
                {' '}This is a Sales Employee
              </label>
            </div>

            {formData.isSalesEmployee && (
              <div className="form-group">
                <label>Monthly Sales Target (PKR)</label>
                <input
                  type="number"
                  name="monthlySalesTarget"
                  value={formData.monthlySalesTarget}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => router.push('/admin/employees')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}
