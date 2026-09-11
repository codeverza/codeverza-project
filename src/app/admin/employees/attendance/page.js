'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '../employees.css';

export const dynamic = 'force-dynamic';

function AttendancePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeFilter = searchParams.get('employee');

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: employeeFilter || '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'Present',
    location: 'Office',
    remarks: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
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

  const fetchAttendance = async () => {
    try {
      const url = employeeFilter 
        ? `/api/employees/attendance?employeeId=${employeeFilter}`
        : '/api/employees/attendance';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setAttendanceRecords(data.records);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/employees/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Attendance marked successfully!');
        setShowForm(false);
        fetchAttendance();
        resetForm();
      } else {
        alert(data.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: employeeFilter || '',
      date: new Date().toISOString().split('T')[0],
      checkIn: '',
      checkOut: '',
      status: 'Present',
      location: 'Office',
      remarks: ''
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Present':
        return 'status-badge status-active';
      case 'Absent':
        return 'status-badge status-terminated';
      case 'Late':
        return 'status-badge status-resigned';
      case 'Half-day':
        return 'status-badge status-suspended';
      case 'Remote':
        return 'status-badge';
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
        <h1>Attendance Management</h1>
        <button className="create-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Mark Attendance'}
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <form onSubmit={handleSubmit} className="employee-form">
            <h3>Mark Attendance</h3>
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
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Check In Time</label>
                <input
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Check Out Time</label>
                <input
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Half-day">Half-day</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                >
                  <option value="Office">Office</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
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
                Mark Attendance
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="employees-table-container">
        {attendanceRecords.length === 0 ? (
          <div className="no-data">
            <p>No attendance records found</p>
          </div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
                <th>Location</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>{record.employeeName}</strong>
                    <div style={{ fontSize: '0.85em', color: '#666' }}>
                      {record.employeeIdNumber}
                    </div>
                  </td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.checkIn || 'N/A'}</td>
                  <td>{record.checkOut || 'N/A'}</td>
                  <td>{record.workingHours ? `${record.workingHours} hrs` : 'N/A'}</td>
                  <td>
                    <span className={getStatusClass(record.status)}>
                      {record.status}
                    </span>
                  </td>
                  <td>{record.location}</td>
                  <td>{record.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={
      <div className="employees-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    }>
      <AttendancePageContent />
    </Suspense>
  );
}
