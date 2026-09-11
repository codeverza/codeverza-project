'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import '../employees.css';

export const dynamic = 'force-dynamic';

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
    monthlySalesTarget: 0,
    password: '',
    loginEnabled: false,
    commissionSlabs: [
      { minSales: 0, maxSales: 100000, percentage: 5 }
    ]
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSlabChange = (index, field, value) => {
    const newSlabs = [...formData.commissionSlabs];
    newSlabs[index][field] = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      commissionSlabs: newSlabs
    }));
  };

  const addSlab = () => {
    const lastSlab = formData.commissionSlabs[formData.commissionSlabs.length - 1];
    setFormData(prev => ({
      ...prev,
      commissionSlabs: [
        ...prev.commissionSlabs,
        { minSales: lastSlab.maxSales, maxSales: lastSlab.maxSales + 100000, percentage: 5 }
      ]
    }));
  };

  const removeSlab = (index) => {
    if (formData.commissionSlabs.length > 1) {
      setFormData(prev => ({
        ...prev,
        commissionSlabs: prev.commissionSlabs.filter((_, i) => i !== index)
      }));
    }
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
        Swal.fire({
          icon: 'success',
          title: 'Employee Created Successfully! 🎉',
          html: `
            <div style="text-align: center;">
              <p style="font-size: 16px; color: #fff; margin: 20px 0;">
                Employee has been added to the system
              </p>
              <div style="background: rgba(177, 76, 255, 0.2); padding: 15px; border-radius: 10px; border: 1px solid rgba(177, 76, 255, 0.3);">
                <p style="margin: 0; color: #b14cff; font-weight: 600; font-size: 14px;">Employee ID</p>
                <p style="margin: 5px 0 0 0; color: #fff; font-size: 18px; font-weight: 700;">${data.generatedEmployeeId}</p>
              </div>
            </div>
          `,
          confirmButtonText: 'View Employees',
          confirmButtonColor: '#b14cff',
          background: '#0d0d0d',
          color: '#fff',
          customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-button'
          }
        }).then(() => {
          router.push('/admin/employees');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Create Employee',
          text: data.message || 'Something went wrong. Please try again.',
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#b14cff',
          background: '#0d0d0d',
          color: '#fff'
        });
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops! Something Went Wrong',
        text: 'Failed to create employee. Please check your connection and try again.',
        confirmButtonText: 'OK',
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
                disabled={formData.salaryType === 'Commission'}
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

            {formData.salaryType !== 'Commission' && (
              <>
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
              </>
            )}
          </div>

          {/* Commission Slabs - Only show for Commission Only */}
          {formData.salaryType === 'Commission' && (
            <div style={{ marginTop: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#2d3748' }}>Commission Slabs</h3>
                <button
                  type="button"
                  onClick={addSlab}
                  style={{
                    padding: '8px 16px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  + Add Slab
                </button>
              </div>

              {formData.commissionSlabs.map((slab, index) => (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr auto',
                    gap: '15px',
                    marginBottom: '15px',
                    padding: '15px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(177, 76, 255, 0.2)'
                  }}
                >
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ color: '#888', fontSize: '12px' }}>Min Sales (PKR)</label>
                    <input
                      type="number"
                      value={slab.minSales}
                      onChange={(e) => handleSlabChange(index, 'minSales', e.target.value)}
                      min="0"
                      style={{ 
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(177, 76, 255, 0.3)',
                        color: '#fff',
                        padding: '10px',
                        borderRadius: '6px'
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ color: '#888', fontSize: '12px' }}>Max Sales (PKR)</label>
                    <input
                      type="text"
                      value={slab.maxSales === 0 ? '∞ (Infinity)' : slab.maxSales}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow typing 0, infinity symbols, or clear field
                        if (value === '' || value === '0' || value.includes('∞') || value.toLowerCase().includes('infinity')) {
                          handleSlabChange(index, 'maxSales', 0);
                        } else {
                          handleSlabChange(index, 'maxSales', value);
                        }
                      }}
                      onFocus={(e) => {
                        if (slab.maxSales === 0) {
                          e.target.value = '0';
                        }
                      }}
                      placeholder="0 = Infinity"
                      style={{ 
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(177, 76, 255, 0.3)',
                        color: slab.maxSales === 0 ? '#b14cff' : '#fff',
                        padding: '10px',
                        borderRadius: '6px',
                        fontWeight: slab.maxSales === 0 ? '600' : 'normal'
                      }}
                    />
                    <small style={{ color: '#666', fontSize: '11px', marginTop: '3px', display: 'block' }}>
                      Enter 0 for no upper limit
                    </small>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ color: '#888', fontSize: '12px' }}>Commission (%)</label>
                    <input
                      type="number"
                      value={slab.percentage}
                      onChange={(e) => handleSlabChange(index, 'percentage', e.target.value)}
                      min="0"
                      max="100"
                      step="0.5"
                      style={{ 
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(177, 76, 255, 0.3)',
                        color: '#fff',
                        padding: '10px',
                        borderRadius: '6px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    {formData.commissionSlabs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlab(index)}
                        style={{
                          padding: '10px 12px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div style={{
                padding: '12px',
                background: 'rgba(177, 76, 255, 0.1)',
                border: '1px solid rgba(177, 76, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#b14cff',
                marginTop: '15px'
              }}>
                <strong>Example:</strong> Rs. 0 - 100,000 par 5%, Rs. 100,000 - 500,000 par 10%, Rs. 500,000+ par 15%
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
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
          )}
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

        {/* Login & Access Settings */}
        <div className="form-section">
          <h2>Login & Access Settings</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="loginEnabled"
                  checked={formData.loginEnabled}
                  onChange={handleChange}
                />
                {' '}Enable Login Access
              </label>
              <small style={{ color: '#718096', marginTop: '5px' }}>
                Agar yeh enable karenge to employee apne account se login kar sakta hai
              </small>
            </div>

            {formData.loginEnabled && (
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Employee ka password enter karein"
                  required={formData.loginEnabled}
                />
                <small style={{ color: '#718096', marginTop: '5px' }}>
                  Yeh password employee ko login karne ke liye chahiye hoga
                </small>
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
