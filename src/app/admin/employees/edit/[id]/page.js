'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import '../../employees.css';

export const dynamic = 'force-dynamic';

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

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
        // Initialize commission slabs if not present
        if (!data.employee.commissionSlabs || data.employee.commissionSlabs.length === 0) {
          data.employee.commissionSlabs = [
            { minSales: 0, maxSales: 0, percentage: 0 }
          ];
        }
        // Initialize permissions if not present
        if (!data.employee.permissions) {
          data.employee.permissions = {
            profile: { view: true },
            attendance: { view: true },
            leaves: { view: true, add: true },
            salary: { view: true },
            projects: { view: true },
            tasks: { view: true, add: true, edit: true },
            sales: { view: true, add: true, edit: true }
          };
        }
        setFormData(data.employee);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Employee Not Found',
          text: 'The employee you are looking for does not exist.',
          confirmButtonText: 'Go Back',
          confirmButtonColor: '#b14cff',
          background: '#0d0d0d',
          color: '#fff'
        }).then(() => {
          router.push('/admin/employees');
        });
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Employee',
        text: 'Could not fetch employee data. Please try again.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#b14cff',
        background: '#0d0d0d',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: employeeId, ...formData })
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Employee Updated Successfully! ✅',
          html: `
            <div style="text-align: center;">
              <p style="font-size: 16px; color: #fff; margin: 20px 0;">
                Employee information has been updated in the system
              </p>
            </div>
          `,
          confirmButtonText: 'View Employees',
          confirmButtonColor: '#b14cff',
          background: '#0d0d0d',
          color: '#fff',
          timer: 2000,
          timerProgressBar: true
        }).then(() => {
          router.push('/admin/employees');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: data.message || 'Something went wrong while updating employee.',
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#b14cff',
          background: '#0d0d0d',
          color: '#fff'
        });
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops! Something Went Wrong',
        text: 'Failed to update employee. Please check your connection and try again.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#b14cff',
        background: '#0d0d0d',
        color: '#fff'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return null; // Global loader will handle this
  }

  if (!formData) {
    return null;
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Edit Employee - {formData.employeeId}</h1>
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
                value={formData.companyEmail || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Photo URL</label>
              <input
                type="url"
                name="photo"
                value={formData.photo || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                rows="2"
              />
            </div>

            <div className="form-group full-width">
              <label>Emergency Contact</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact || ''}
                onChange={handleChange}
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
                value={formData.reportingManager || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Resigned">Resigned</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                value={formData.role || 'Employee'}
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
                value={formData.monthlySalary || 0}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Salary Type</label>
              <select
                name="salaryType"
                value={formData.salaryType || 'Fixed'}
                onChange={handleChange}
              >
                <option value="Fixed">Fixed Salary</option>
                <option value="Commission">Commission Only</option>
                <option value="Salary+Commission">Salary + Commission</option>
              </select>
            </div>

            {(formData.salaryType === 'Commission' || formData.salaryType === 'Salary+Commission') && (
              <div className="form-group">
                <label>Commission Percentage (%)</label>
                <input
                  type="number"
                  name="commissionPercentage"
                  value={formData.commissionPercentage || 0}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.5"
                />
              </div>
            )}
          </div>

          {formData.salaryType === 'Commission' && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#b14cff' }}>
                  Commission Slabs
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const newSlabs = [...(formData.commissionSlabs || [])];
                    const lastSlab = newSlabs[newSlabs.length - 1];
                    newSlabs.push({
                      minSales: lastSlab ? lastSlab.maxSales : 0,
                      maxSales: 0,
                      percentage: 0
                    });
                    setFormData(prev => ({ ...prev, commissionSlabs: newSlabs }));
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #b14cff 0%, #8b3ac7 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  + Add Slab
                </button>
              </div>

              {(formData.commissionSlabs || []).map((slab, index) => (
                <div key={index} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr auto',
                  gap: '12px',
                  padding: '15px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(177, 76, 255, 0.2)',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ color: '#888', fontSize: '12px' }}>Min Sales (PKR)</label>
                    <input
                      type="number"
                      value={slab.minSales}
                      onChange={(e) => {
                        const newSlabs = [...formData.commissionSlabs];
                        newSlabs[index].minSales = parseFloat(e.target.value) || 0;
                        setFormData(prev => ({ ...prev, commissionSlabs: newSlabs }));
                      }}
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
                        const newSlabs = [...formData.commissionSlabs];
                        // Allow typing 0, infinity symbols, or clear field
                        if (value === '' || value === '0' || value.includes('∞') || value.toLowerCase().includes('infinity')) {
                          newSlabs[index].maxSales = 0;
                        } else {
                          newSlabs[index].maxSales = parseFloat(value) || 0;
                        }
                        setFormData(prev => ({ ...prev, commissionSlabs: newSlabs }));
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
                      onChange={(e) => {
                        const newSlabs = [...formData.commissionSlabs];
                        newSlabs[index].percentage = parseFloat(e.target.value) || 0;
                        setFormData(prev => ({ ...prev, commissionSlabs: newSlabs }));
                      }}
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
                    {(formData.commissionSlabs || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newSlabs = formData.commissionSlabs.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, commissionSlabs: newSlabs }));
                        }}
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
                    checked={formData.excludeThirdPartyExpenses || false}
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
                value={formData.casualLeaves || 0}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Sick Leaves</label>
              <input
                type="number"
                name="sickLeaves"
                value={formData.sickLeaves || 0}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Annual Leaves</label>
              <input
                type="number"
                name="annualLeaves"
                value={formData.annualLeaves || 0}
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
                  checked={formData.isSalesEmployee || false}
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
                  value={formData.monthlySalesTarget || 0}
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
                  checked={formData.loginEnabled || false}
                  onChange={handleChange}
                />
                {' '}Enable Login Access
              </label>
              <small style={{ color: '#718096', marginTop: '5px' }}>
                Agar yeh enable karenge to employee apne account se login kar sakta hai
              </small>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="text"
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
              />
              <small style={{ color: '#718096', marginTop: '5px' }}>
                {formData.password ? 'New password will be set' : 'Current password will remain unchanged'}
              </small>
            </div>

            {formData.loginEnabled && (
              <div className="form-group full-width">
                <div style={{ 
                  padding: '12px', 
                  background: '#edf2f7', 
                  borderRadius: '8px',
                  border: '1px solid #cbd5e0'
                }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#4a5568' }}>
                    <strong>Login Credentials:</strong><br/>
                    Employee ID: <strong>{formData.employeeId}</strong><br/>
                    Password: {formData.password ? <strong>Updated</strong> : <span style={{color: '#718096'}}>Existing password</span>}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Employee Permissions */}
        <div className="form-section">
          <h2>Dashboard Access Permissions</h2>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
            Control what this employee can see and do in their dashboard
          </p>
          
          <div className="form-grid">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.permissions?.attendance?.view || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    permissions: {
                      ...prev.permissions,
                      attendance: { view: e.target.checked }
                    }
                  }))}
                />
                {' '}Allow Attendance Access
              </label>
              <small style={{ color: '#718096', marginTop: '5px', display: 'block' }}>
                Employee can view their attendance records
              </small>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.permissions?.leaves?.view || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    permissions: {
                      ...prev.permissions,
                      leaves: { 
                        view: e.target.checked,
                        add: e.target.checked 
                      }
                    }
                  }))}
                />
                {' '}Allow Leaves Access
              </label>
              <small style={{ color: '#718096', marginTop: '5px', display: 'block' }}>
                Employee can view and request leaves
              </small>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.permissions?.salary?.view || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    permissions: {
                      ...prev.permissions,
                      salary: { view: e.target.checked }
                    }
                  }))}
                />
                {' '}Allow Salary Access
              </label>
              <small style={{ color: '#718096', marginTop: '5px', display: 'block' }}>
                Employee can view their salary details
              </small>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.permissions?.tasks?.view || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    permissions: {
                      ...prev.permissions,
                      tasks: { 
                        view: e.target.checked,
                        add: e.target.checked,
                        edit: e.target.checked
                      }
                    }
                  }))}
                />
                {' '}Allow Tasks Access
              </label>
              <small style={{ color: '#718096', marginTop: '5px', display: 'block' }}>
                Employee can view and manage their tasks
              </small>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.permissions?.projects?.view || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    permissions: {
                      ...prev.permissions,
                      projects: { view: e.target.checked }
                    }
                  }))}
                />
                {' '}Allow Projects Access
              </label>
              <small style={{ color: '#718096', marginTop: '5px', display: 'block' }}>
                Employee can view their assigned projects
              </small>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.permissions?.sales?.view || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    permissions: {
                      ...prev.permissions,
                      sales: { 
                        view: e.target.checked,
                        add: e.target.checked,
                        edit: e.target.checked
                      }
                    }
                  }))}
                />
                {' '}Allow Sales Access
              </label>
              <small style={{ color: '#718096', marginTop: '5px', display: 'block' }}>
                Employee can manage leads, follow-ups, and view commission
              </small>
            </div>
          </div>

          <div style={{
            padding: '15px',
            background: 'rgba(177, 76, 255, 0.1)',
            border: '1px solid rgba(177, 76, 255, 0.3)',
            borderRadius: '8px',
            marginTop: '15px'
          }}>
            <strong style={{ color: '#b14cff' }}>Note:</strong>
            <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '13px' }}>
              Profile tab is always visible. Unchecked tabs will not appear in employee dashboard.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => router.push('/admin/employees')}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Update Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}
