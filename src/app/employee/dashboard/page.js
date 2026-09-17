'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getEmployeeAuth, clearEmployeeAuth, getSessionTimeRemaining } from '@/lib/employeeAuth';
import ProtectedRoute from '../components/ProtectedRoute';
import Swal from 'sweetalert2';
import './dashboard.css';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [sessionTime, setSessionTime] = useState(null);
  
  // Data states
  const [profileData, setProfileData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [leavesData, setLeavesData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [salesData, setSalesData] = useState({
    leads: [],
    followups: [],
    stats: { total: 0, won: 0, expected: 0, commission: 0 }
  });

  useEffect(() => {
    checkAuth();
    
    // Update session time every minute
    const interval = setInterval(() => {
      const timeRemaining = getSessionTimeRemaining();
      setSessionTime(timeRemaining);
      
      // Auto logout if session expired
      if (timeRemaining !== null && timeRemaining <= 0) {
        handleLogout(true);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const checkAuth = () => {
    const empData = getEmployeeAuth();
    
    if (!empData) {
      router.push('/employee/login');
      return;
    }

    setEmployee(empData);
    // Use permissions from employee data, no defaults for attendance/leaves
    console.log('Employee Permissions from localStorage:', empData.permissions);
    setPermissions(empData.permissions);
    setSessionTime(getSessionTimeRemaining());
    loadEmployeeData(empData.id);
    setLoading(false);
  };

  const loadEmployeeData = async (employeeId) => {
    try {
      // Load profile data
      const profileRes = await fetch(`/api/employees?id=${employeeId}`);
      const profileData = await profileRes.json();
      if (profileData.success) {
        setProfileData(profileData.employee);
      }

      // Load attendance if permitted
      if (permissions?.attendance?.view) {
        const attRes = await fetch(`/api/employees/attendance?employeeId=${employeeId}`);
        const attData = await attRes.json();
        if (attData.success) {
          setAttendanceData(attData.attendance || []);
        }
      }

      // Load leaves if permitted
      if (permissions?.leaves?.view) {
        const leavesRes = await fetch(`/api/employees/leaves?employeeId=${employeeId}`);
        const leavesData = await leavesRes.json();
        if (leavesData.success) {
          setLeavesData(leavesData.leaves || []);
        }
      }

      // Load salary if permitted
      if (permissions?.salary?.view) {
        const salaryRes = await fetch(`/api/employees/salary?employeeId=${employeeId}`);
        const salaryData = await salaryRes.json();
        if (salaryData.success) {
          setSalaryData(salaryData.salaries || []);
        }
      }

      // Load projects if permitted
      if (permissions?.projects?.view) {
        const projRes = await fetch(`/api/employees/projects?employeeId=${employeeId}`);
        const projData = await projRes.json();
        if (projData.success) {
          setProjectsData(projData.projects || []);
        }
      }

      // Load tasks - ALWAYS LOAD (removed permission check for debugging)
      try {
        console.log('Fetching tasks for employee:', employeeId);
        const tasksRes = await fetch(`/api/tasks?employeeId=${employeeId}`);
        const tasksData = await tasksRes.json();
        console.log('Tasks API Response:', tasksData);
        if (tasksData.success) {
          console.log('Tasks found:', tasksData.tasks?.length || 0);
          setTasksData(tasksData.tasks || []);
        } else {
          console.error('Tasks API returned error:', tasksData.message);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }

      // Load sales data if permitted
      if (permissions?.sales?.view) {
        try {
          // Load leads
          const leadsRes = await fetch(`/api/sales/leads?employeeId=${employeeId}`);
          const leadsData = await leadsRes.json();
          
          // Load follow-ups
          const followupsRes = await fetch(`/api/sales/followups?employeeId=${employeeId}`);
          const followupsData = await followupsRes.json();
          
          if (leadsData.success && followupsData.success) {
            const leads = leadsData.leads || [];
            const followups = followupsData.followups || [];
            
            // Calculate stats
            const wonLeads = leads.filter(l => l.status === 'Won');
            const totalSales = wonLeads.reduce((sum, l) => sum + (l.actualValue || 0), 0);
            
            // Calculate commission based on employee's commission slabs
            let commission = 0;
            if (profileData?.commissionSlabs) {
              for (const slab of profileData.commissionSlabs) {
                if (totalSales >= slab.minSales && (slab.maxSales === 0 || totalSales <= slab.maxSales)) {
                  commission = (totalSales * slab.percentage) / 100;
                  break;
                }
              }
            }
            
            setSalesData({
              leads,
              followups,
              stats: {
                total: leads.length,
                won: wonLeads.length,
                expected: leads.reduce((sum, l) => sum + (l.expectedValue || 0), 0),
                commission
              }
            });
          }
        } catch (error) {
          console.error('Error loading sales data:', error);
        }
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
    }
  };

  const handleLogout = (isAutoLogout = false) => {
    const message = isAutoLogout 
      ? 'Session expired. Please login again.' 
      : 'Kya aap logout karna chahte hain?';
    
    if (isAutoLogout || confirm(message)) {
      clearEmployeeAuth();
      router.push('/employee/login');
    }
  };

  if (loading) {
    return null; // Global loader will handle this
  }

  if (!employee) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="employee-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <img 
            src="/img/codeverza-logo.png" 
            alt="Codeverza" 
            className="header-logo"
          />
          <h1>Employee Dashboard</h1>
        </div>
        <div className="header-right">
          <div className="employee-info">
            {employee.photo && (
              <img 
                src={employee.photo} 
                alt={employee.name} 
                className="employee-avatar"
              />
            )}
            <div className="employee-details">
              <h3>{employee.name}</h3>
              <p>{employee.designation}</p>
              {sessionTime !== null && (
                <small style={{ color: '#718096', fontSize: '11px' }}>
                  Session: {Math.floor(sessionTime)}h remaining
                </small>
              )}
            </div>
          </div>
          <button onClick={() => handleLogout(false)} className="logout-btn">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'profile' ? 'active' : ''} 
          onClick={() => setActiveTab('profile')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Profile
        </button>
        
        {permissions?.attendance?.view && (
          <button 
            className={activeTab === 'attendance' ? 'active' : ''} 
            onClick={() => setActiveTab('attendance')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Attendance
          </button>
        )}
        
        {permissions?.leaves?.view && (
          <button 
            className={activeTab === 'leaves' ? 'active' : ''} 
            onClick={() => setActiveTab('leaves')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Leaves
          </button>
        )}
        
        {permissions?.salary?.view && (
          <button 
            className={activeTab === 'salary' ? 'active' : ''} 
            onClick={() => setActiveTab('salary')}
          >
            <span style={{ 
              fontSize: '18px', 
              fontWeight: '800',
              fontFamily: 'monospace',
              letterSpacing: '-1px'
            }}>₨</span>
            Salary
          </button>
        )}
        
        {permissions?.projects?.view && (
          <button 
            className={activeTab === 'projects' ? 'active' : ''} 
            onClick={() => setActiveTab('projects')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            Projects
          </button>
        )}
        
        <button 
          className={activeTab === 'tasks' ? 'active' : ''} 
          onClick={() => setActiveTab('tasks')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          Tasks
        </button>

        {permissions?.sales?.view && (
          <button 
            className={activeTab === 'sales' ? 'active' : ''} 
            onClick={() => setActiveTab('sales')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Sales
          </button>
        )}
      </nav>

      {/* Content Area */}
      <main className="dashboard-content">
        {activeTab === 'profile' && <ProfileTab data={profileData} permissions={permissions} />}
        {activeTab === 'attendance' && <AttendanceTab data={attendanceData} />}
        {activeTab === 'leaves' && <LeavesTab data={leavesData} employeeId={employee.id} permissions={permissions} />}
        {activeTab === 'salary' && <SalaryTab data={salaryData} employee={profileData} />}
        {activeTab === 'projects' && <ProjectsTab data={projectsData} />}
        {activeTab === 'tasks' && <TasksTab data={tasksData} employeeId={employee.id} onRefresh={() => loadEmployeeData(employee.id)} />}
        {activeTab === 'sales' && <SalesTab data={salesData} employeeId={employee.id} employee={profileData} onRefresh={() => loadEmployeeData(employee.id)} />}
      </main>
    </div>
    </ProtectedRoute>
  );
}

// Profile Tab Component
function ProfileTab({ data, permissions }) {
  if (!data) return <div className="loading-text">Loading profile...</div>;

  return (
    <div className="profile-tab">
      <div className="profile-card">
        <h2>Personal Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Employee ID</label>
            <p>{data.employeeId}</p>
          </div>
          <div className="info-item">
            <label>Full Name</label>
            <p>{data.name}</p>
          </div>
          <div className="info-item">
            <label>CNIC</label>
            <p>{data.cnic}</p>
          </div>
          <div className="info-item">
            <label>Contact Number</label>
            <p>{data.contactNumber}</p>
          </div>
          <div className="info-item">
            <label>Personal Email</label>
            <p>{data.personalEmail}</p>
          </div>
          <div className="info-item">
            <label>Company Email</label>
            <p>{data.companyEmail || 'N/A'}</p>
          </div>
          <div className="info-item full-width">
            <label>Address</label>
            <p>{data.address || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="profile-card">
        <h2>Employment Details</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Designation</label>
            <p>{data.designation}</p>
          </div>
          <div className="info-item">
            <label>Department</label>
            <p>{data.department}</p>
          </div>
          <div className="info-item">
            <label>Employment Type</label>
            <p>{data.employmentType}</p>
          </div>
          <div className="info-item">
            <label>Joining Date</label>
            <p>{new Date(data.joiningDate).toLocaleDateString('en-GB')}</p>
          </div>
          <div className="info-item">
            <label>Status</label>
            <p className={`status-badge status-${data.status?.toLowerCase()}`}>{data.status}</p>
          </div>
          <div className="info-item">
            <label>Reporting Manager</label>
            <p>{data.reportingManager || 'N/A'}</p>
          </div>
        </div>
      </div>

      {permissions?.leaves?.view && (
        <div className="profile-card">
          <h2>Leave Balance</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Casual Leaves</label>
              <p className="leave-count">{data.casualLeaves || 0}</p>
            </div>
            <div className="info-item">
              <label>Sick Leaves</label>
              <p className="leave-count">{data.sickLeaves || 0}</p>
            </div>
            <div className="info-item">
              <label>Annual Leaves</label>
              <p className="leave-count">{data.annualLeaves || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Attendance Tab Component
function AttendanceTab({ data }) {
  return (
    <div className="attendance-tab">
      <h2>My Attendance History</h2>
      {data.length === 0 ? (
        <div className="empty-state">
          <p>Abhi tak koi attendance record nahi hai</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record, index) => (
                <tr key={index}>
                  <td>{new Date(record.date).toLocaleDateString('en-GB')}</td>
                  <td>{record.checkIn || '-'}</td>
                  <td>{record.checkOut || '-'}</td>
                  <td>{record.workingHours || '-'}</td>
                  <td><span className={`status-badge status-${record.status?.toLowerCase()}`}>{record.status}</span></td>
                  <td>{record.location || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Leaves Tab Component
function LeavesTab({ data, employeeId, permissions }) {
  return (
    <div className="leaves-tab">
      <div className="tab-header">
        <h2>My Leave Requests</h2>
        {permissions?.leaves?.add && (
          <button className="action-btn" onClick={() => alert('Leave request form coming soon!')}>
            + Apply Leave
          </button>
        )}
      </div>
      {data.length === 0 ? (
        <div className="empty-state">
          <p>Abhi tak koi leave request nahi hai</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((leave, index) => (
                <tr key={index}>
                  <td>{leave.leaveType}</td>
                  <td>{new Date(leave.startDate).toLocaleDateString('en-GB')}</td>
                  <td>{new Date(leave.endDate).toLocaleDateString('en-GB')}</td>
                  <td>{leave.numberOfDays}</td>
                  <td>{leave.reason}</td>
                  <td><span className={`status-badge status-${leave.status?.toLowerCase()}`}>{leave.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Salary Tab Component
function SalaryTab({ data, employee }) {
  if (!employee) return <div className="loading-text">Loading salary information...</div>;

  const salaryType = employee.salaryType || 'Fixed';
  const monthlySalary = employee.monthlySalary || 0;
  const commissionPercentage = employee.commissionPercentage || 0;
  const commissionSlabs = employee.commissionSlabs || [];
  const excludeThirdParty = employee.excludeThirdPartyExpenses || false;

  return (
    <div className="salary-tab">
      {/* Salary Structure Card */}
      <div className="salary-structure-card">
        <h2>My Salary Structure</h2>
        
        <div className="salary-type-display">
          <div className="salary-type-badge" style={{
            background: 'linear-gradient(135deg, #b14cff 0%, #8b3ac7 100%)',
            padding: '12px 24px',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '18px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '20px',
            display: 'inline-block',
            border: '1px solid rgba(177, 76, 255, 0.3)',
            boxShadow: '0 4px 15px rgba(177, 76, 255, 0.2)'
          }}>
            {salaryType === 'Fixed' && '💼 Fixed Salary'}
            {salaryType === 'Commission' && '📊 Commission Only'}
            {salaryType === 'Salary+Commission' && '💰 Salary + Commission'}
          </div>
        </div>

        {/* Fixed Salary Display */}
        {salaryType === 'Fixed' && (
          <div className="salary-details-card" style={{
            background: 'rgba(177, 76, 255, 0.1)',
            border: '2px solid rgba(177, 76, 255, 0.3)',
            borderRadius: '12px',
            padding: '24px',
            marginTop: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>Monthly Fixed Salary</p>
              <h1 style={{ 
                fontSize: '42px', 
                color: '#b14cff', 
                margin: '0',
                fontWeight: '800',
                textShadow: '0 2px 8px rgba(177, 76, 255, 0.5)'
              }}>
                Rs. {monthlySalary.toLocaleString()}
              </h1>
              <p style={{ color: '#666', fontSize: '13px', marginTop: '12px' }}>
                Aapko har mahine fixed salary milti hai
              </p>
            </div>
          </div>
        )}

        {/* Commission Only Display */}
        {salaryType === 'Commission' && (
          <div style={{ marginTop: '20px' }}>
            {commissionSlabs.length > 0 ? (
              <div className="commission-slabs-display">
                <h3 style={{ color: '#b14cff', marginBottom: '15px', fontSize: '16px', fontWeight: '700' }}>
                  📊 Commission Slabs
                </h3>
                {commissionSlabs.map((slab, index) => (
                  <div key={index} style={{
                    background: 'rgba(177, 76, 255, 0.05)',
                    border: '2px solid rgba(177, 76, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '12px',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    alignItems: 'center',
                    gap: '20px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(177, 76, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(177, 76, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(177, 76, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(177, 76, 255, 0.2)';
                  }}
                  >
                    <div>
                      <p style={{ color: '#888', fontSize: '13px', marginBottom: '6px' }}>
                        Sales Range
                      </p>
                      <p style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>
                        Rs. {slab.minSales.toLocaleString()} 
                        <span style={{ margin: '0 8px', color: '#666' }}>→</span>
                        {slab.maxSales === 0 ? (
                          <span style={{ color: '#b14cff', fontWeight: '700' }}>∞ (Infinity)</span>
                        ) : (
                          `Rs. ${slab.maxSales.toLocaleString()}`
                        )}
                      </p>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #b14cff 0%, #8b3ac7 100%)',
                      padding: '16px 28px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      boxShadow: '0 4px 15px rgba(177, 76, 255, 0.3)'
                    }}>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '4px' }}>
                        Commission
                      </p>
                      <p style={{ color: '#fff', fontSize: '28px', fontWeight: '800' }}>
                        {slab.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
                {excludeThirdParty && (
                  <div style={{
                    background: 'rgba(177, 76, 255, 0.1)',
                    border: '1px solid rgba(177, 76, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '15px',
                    color: '#b14cff',
                    fontSize: '13px',
                    textAlign: 'center'
                  }}>
                    ℹ️ Third-party expenses commission se exclude hain
                  </div>
                )}
              </div>
            ) : (
              <div className="salary-details-card" style={{
                background: 'rgba(177, 76, 255, 0.1)',
                border: '2px solid rgba(177, 76, 255, 0.3)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>Commission Rate</p>
                <h1 style={{ 
                  fontSize: '42px', 
                  color: '#b14cff', 
                  margin: '0',
                  fontWeight: '800',
                  textShadow: '0 2px 8px rgba(177, 76, 255, 0.5)'
                }}>
                  {commissionPercentage}%
                </h1>
                <p style={{ color: '#666', fontSize: '13px', marginTop: '12px' }}>
                  Aapki sales par commission milta hai
                </p>
              </div>
            )}
          </div>
        )}

        {/* Salary + Commission Display */}
        {salaryType === 'Salary+Commission' && (
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="salary-details-card" style={{
              background: 'rgba(177, 76, 255, 0.1)',
              border: '2px solid rgba(177, 76, 255, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>Monthly Fixed Salary</p>
              <h2 style={{ 
                fontSize: '32px', 
                color: '#b14cff', 
                margin: '0',
                fontWeight: '800',
                textShadow: '0 2px 8px rgba(177, 76, 255, 0.5)'
              }}>
                Rs. {monthlySalary.toLocaleString()}
              </h2>
            </div>

            <div className="salary-details-card" style={{
              background: 'rgba(177, 76, 255, 0.1)',
              border: '2px solid rgba(177, 76, 255, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>+ Commission Rate</p>
              <h2 style={{ 
                fontSize: '32px', 
                color: '#b14cff', 
                margin: '0',
                fontWeight: '800',
                textShadow: '0 2px 8px rgba(177, 76, 255, 0.5)'
              }}>
                {commissionPercentage}%
              </h2>
            </div>

            {excludeThirdParty && (
              <div style={{
                gridColumn: '1 / -1',
                background: 'rgba(177, 76, 255, 0.1)',
                border: '1px solid rgba(177, 76, 255, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                color: '#b14cff',
                fontSize: '13px',
                textAlign: 'center'
              }}>
                ℹ️ Third-party expenses commission se exclude hain
              </div>
            )}
          </div>
        )}
      </div>

      {/* Salary History */}
      <div style={{ marginTop: '30px' }}>
        <h2>Payment History</h2>
        {data.length === 0 ? (
          <div className="empty-state">
            <p>Abhi tak koi salary record nahi hai</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Base Salary</th>
                  {(salaryType === 'Commission' || salaryType === 'Salary+Commission') && <th>Commission</th>}
                  <th>Bonus</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((salary, index) => (
                  <tr key={index}>
                    <td>{salary.month}</td>
                    <td>Rs. {salary.baseSalary?.toLocaleString()}</td>
                    {(salaryType === 'Commission' || salaryType === 'Salary+Commission') && (
                      <td style={{ color: '#b14cff', fontWeight: '600' }}>
                        Rs. {salary.commission?.toLocaleString() || 0}
                      </td>
                    )}
                    <td style={{ color: '#888' }}>Rs. {salary.bonus?.toLocaleString() || 0}</td>
                    <td style={{ color: '#ef4444' }}>Rs. {salary.deductions?.toLocaleString() || 0}</td>
                    <td><strong style={{ color: '#b14cff', fontSize: '16px' }}>Rs. {salary.netSalary?.toLocaleString()}</strong></td>
                    <td><span className={`status-badge status-${salary.paymentStatus?.toLowerCase()}`}>{salary.paymentStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Projects Tab Component
function ProjectsTab({ data }) {
  return (
    <div className="projects-tab">
      <h2>My Projects</h2>
      {data.length === 0 ? (
        <div className="empty-state">
          <p>Abhi koi project assign nahi hui</p>
        </div>
      ) : (
        <div className="projects-grid">
          {data.map((project, index) => (
            <div key={index} className="project-card">
              <div className="project-header">
                <h3>{project.projectName}</h3>
                <span className={`status-badge status-${project.status?.toLowerCase().replace(' ', '-')}`}>
                  {project.status}
                </span>
              </div>
              <p className="project-client">Client: {project.clientName}</p>
              <div className="project-dates">
                <span>Start: {new Date(project.startDate).toLocaleDateString('en-GB')}</span>
                <span>Deadline: {new Date(project.deadline).toLocaleDateString('en-GB')}</span>
              </div>
              <div className="project-footer">
                <span className={`priority-badge priority-${project.priority?.toLowerCase()}`}>
                  {project.priority}
                </span>
                <span className="project-value">Rs. {project.projectValue?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Tasks Tab Component
function TasksTab({ data, employeeId, onRefresh }) {
  const [selectedTask, setSelectedTask] = useState(null);

  const handleStartTask = async (task) => {
    const result = await Swal.fire({
      title: 'Start Task?',
      text: `Mark "${task.taskTitle}" as In Progress?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Start',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#b14cff',
      cancelButtonColor: '#6b7280',
      background: '#0d0d0d',
      color: '#fff',
      backdrop: 'rgba(0, 0, 0, 0.8)',
      customClass: {
        popup: 'task-detail-popup'
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: task.id,
            status: 'In Progress',
            progress: 10
          })
        });

        const resData = await response.json();

        if (resData.success) {
          Swal.fire({
            icon: 'success',
            title: 'Task Started!',
            text: 'Task status updated to In Progress',
            confirmButtonColor: '#b14cff',
            background: '#0d0d0d',
            color: '#fff',
            timer: 2000,
            backdrop: 'rgba(0, 0, 0, 0.8)',
            customClass: {
              popup: 'task-detail-popup'
            }
          });
          if (onRefresh) onRefresh();
        } else {
          throw new Error(resData.message);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: error.message || 'Could not update task',
          confirmButtonColor: '#b14cff',
          background: '#0d0d0d',
          color: '#fff'
        });
      }
    }
  };

  const handleCompleteTask = async (task) => {
    const result = await Swal.fire({
      title: 'Complete Task',
      html: `
        <div style="text-align: left; margin-top: 20px;">
          <label style="color: #fff; font-size: 14px; font-weight: 600; margin-bottom: 8px; display: block;">
            Completion Report *
          </label>
          <textarea 
            id="completion-report" 
            placeholder="Describe what you accomplished, challenges faced, and any notes for admin..."
            style="
              width: 100%;
              min-height: 150px;
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
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Submit for Review',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#b14cff',
      cancelButtonColor: '#6b7280',
      background: '#0d0d0d',
      color: '#fff',
      backdrop: 'rgba(0, 0, 0, 0.8)',
      customClass: {
        popup: 'task-detail-popup',
        title: 'task-detail-title'
      },
      preConfirm: () => {
        const report = document.getElementById('completion-report').value;
        if (!report || report.trim() === '') {
          Swal.showValidationMessage('Please enter a completion report');
          return false;
        }
        return report;
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
            id: task.id,
            status: 'Completed',
            completionReport: result.value,
            progress: 100
          })
        });

        const resData = await response.json();

        if (resData.success) {
          Swal.fire({
            icon: 'success',
            title: 'Task Submitted! ✅',
            html: `
              <div style="text-align: center;">
                <p style="font-size: 16px; color: #fff; margin: 20px 0;">
                  Your task has been submitted for admin review
                </p>
              </div>
            `,
            confirmButtonColor: '#b14cff',
            background: '#0d0d0d',
            color: '#fff',
            timer: 3000,
            timerProgressBar: true
          });
          if (onRefresh) onRefresh();
        } else {
          throw new Error(resData.message);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: error.message || 'Could not complete task',
          confirmButtonColor: '#b14cff',
          background: '#0d0d0d',
          color: '#fff'
        });
      }
    }
  };

  const viewTaskDetails = (task) => {
    setSelectedTask(task);
    
    Swal.fire({
      title: task.taskTitle,
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <span class="badge ${
              task.status === 'To Do' ? 'status-todo' :
              task.status === 'In Progress' ? 'status-in-progress' :
              task.status === 'Completed' ? 'status-completed' :
              task.status === 'Approved' ? 'status-approved' :
              'status-rejected'
            }" style="margin-right: 8px;">${task.status}</span>
            <span class="badge ${
              task.priority === 'Low' ? 'priority-low' :
              task.priority === 'Medium' ? 'priority-medium' :
              task.priority === 'High' ? 'priority-high' :
              'priority-urgent'
            }">${task.priority} Priority</span>
          </div>
          
          ${task.taskDescription ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Description:</strong>
              <p style="color: #fff; margin: 8px 0 0 0; white-space: pre-wrap; line-height: 1.6;">${task.taskDescription}</p>
            </div>
          ` : ''}
          
          <div style="margin-bottom: 12px;">
            <strong style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Project:</strong>
            <p style="color: #fff; margin: 5px 0 0 0;">${task.projectName || 'No Project'}</p>
          </div>
          
          <div style="margin-bottom: 12px;">
            <strong style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Deadline:</strong>
            <p style="color: #fff; margin: 5px 0 0 0;">${new Date(task.deadline).toLocaleDateString('en-GB')}</p>
          </div>
          
          <div style="margin-bottom: 12px;">
            <strong style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Progress:</strong>
            <p style="color: #b14cff; margin: 5px 0 0 0; font-weight: 600; font-size: 16px;">${task.progress || 0}%</p>
          </div>
          
          ${task.rejectionReason ? `
            <div style="
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.3);
              border-radius: 8px;
              padding: 15px;
              margin-top: 15px;
            ">
              <strong style="color: #ef4444; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Rejection Reason:</strong>
              <p style="color: #ef4444; margin: 8px 0 0 0; white-space: pre-wrap; line-height: 1.6;">${task.rejectionReason}</p>
            </div>
          ` : ''}
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#b14cff',
      background: '#0d0d0d',
      color: '#fff',
      width: '600px',
      backdrop: `
        rgba(0, 0, 0, 0.8)
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><radialGradient id="g1"><stop offset="0%" stop-color="%23b14cff" stop-opacity="0.3"/><stop offset="100%" stop-color="%23000" stop-opacity="0"/></radialGradient><radialGradient id="g2"><stop offset="0%" stop-color="%238b5cf6" stop-opacity="0.2"/><stop offset="100%" stop-color="%23000" stop-opacity="0"/></radialGradient></defs><circle cx="10%" cy="20%" r="200" fill="url(%23g1)"><animate attributeName="cx" values="10%;90%;10%" dur="20s" repeatCount="indefinite"/><animate attributeName="cy" values="20%;80%;20%" dur="15s" repeatCount="indefinite"/></circle><circle cx="80%" cy="70%" r="150" fill="url(%23g2)"><animate attributeName="cx" values="80%;20%;80%" dur="18s" repeatCount="indefinite"/><animate attributeName="cy" values="70%;30%;70%" dur="16s" repeatCount="indefinite"/></circle><circle cx="50%" cy="50%" r="180" fill="url(%23g1)" opacity="0.4"><animate attributeName="r" values="180;220;180" dur="12s" repeatCount="indefinite"/></circle></svg>')
        left top
        no-repeat
      `,
      customClass: {
        popup: 'task-detail-popup',
        title: 'task-detail-title',
        htmlContainer: 'task-detail-content',
        confirmButton: 'task-detail-btn'
      }
    });
  };

  return (
    <div className="tasks-tab">
      <h2>My Tasks</h2>
      {data.length === 0 ? (
        <div className="empty-state">
          <p>Abhi koi task assign nahi hui</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div style={{ maxWidth: '200px' }}>
                      <strong style={{ cursor: 'pointer', color: '#b14cff' }} onClick={() => viewTaskDetails(task)}>
                        {task.taskTitle}
                      </strong>
                    </div>
                  </td>
                  <td>{task.projectName || 'N/A'}</td>
                  <td>
                    <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>{new Date(task.deadline).toLocaleDateString('en-GB')}</td>
                  <td>
                    <span className={`status-badge status-${task.status?.toLowerCase().replace(' ', '-')}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${task.progress || 0}%` }}></div>
                      </div>
                      <span className="progress-text">{task.progress || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {task.status === 'To Do' && (
                        <button
                          onClick={() => handleStartTask(task)}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <button
                          onClick={() => handleCompleteTask(task)}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Complete
                        </button>
                      )}
                      {(task.status === 'Completed' || task.status === 'Approved' || task.status === 'Rejected') && (
                        <button
                          onClick={() => viewTaskDetails(task)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(177, 76, 255, 0.2)',
                            color: '#b14cff',
                            border: '1px solid rgba(177, 76, 255, 0.3)',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// Sales Tab Component
function SalesTab({ data, employeeId, employee, onRefresh }) {
  const [activeView, setActiveView] = useState('leads');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddLead, setShowAddLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  
  useEffect(() => {
    loadLeads();
  }, [employeeId]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leads?employeeId=${employeeId}`);
      const data = await response.json();
      if (data.success) {
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Stats
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.stage === 'New').length,
    contacted: leads.filter(l => l.stage === 'Contacted').length,
    quotation: leads.filter(l => l.stage === 'Quotation Sent').length,
    negotiation: leads.filter(l => l.stage === 'Negotiation').length,
    won: leads.filter(l => l.stage === 'Won').length,
    lost: leads.filter(l => l.stage === 'Lost').length,
    totalValue: leads.reduce((sum, l) => sum + (l.expectedValue || 0), 0),
    wonValue: leads.filter(l => l.stage === 'Won').reduce((sum, l) => sum + (l.wonPrice || 0), 0),
  };

  // Add Lead Handler
  const handleAddLead = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const stage = formData.get('stage');
    const wonPrice = formData.get('wonPrice');
    
    console.log('Form Data:', {
      clientName: formData.get('clientName'),
      serviceType: formData.get('serviceType'),
      priority: formData.get('priority'),
      source: formData.get('source'),
      stage: stage,
      employeeId: employee?.id,
      employeeName: employee?.name
    });
    
    // Validate: If stage is Won, wonPrice is required
    if (stage === 'Won' && (!wonPrice || parseFloat(wonPrice) <= 0)) {
      await Swal.fire({
        icon: 'error',
        title: 'Won Price Required',
        text: 'Please enter the final deal price when marking lead as Won',
        confirmButtonColor: '#b14cff',
        background: '#0d0d0d',
        color: '#fff'
      });
      return;
    }
    
    // Show loading popup
    Swal.fire({
      title: 'Adding Lead...',
      text: 'Please wait while we create your lead',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: '#0d0d0d',
      color: '#fff'
    });
    
    const leadData = {
      clientName: formData.get('clientName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      companyName: formData.get('companyName'),
      serviceType: formData.get('serviceType'),
      expectedValue: 0, // Set to 0 by default since we removed the field
      priority: formData.get('priority'),
      source: formData.get('source'),
      stage: stage,
      nextFollowUp: formData.get('nextFollowUp') || null,
      notes: formData.get('notes'),
      createdBy: employee?.id,
      createdByName: employee?.name || 'Employee'
    };

    // Add wonPrice if stage is Won
    if (stage === 'Won' && wonPrice) {
      leadData.wonPrice = parseFloat(wonPrice);
    }

    console.log('Sending lead data:', leadData);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Lead Added Successfully!',
          text: 'New lead has been created and saved',
          confirmButtonColor: '#10b981',
          background: '#0d0d0d',
          color: '#fff',
          timer: 2000,
          showConfirmButton: true
        });
        setShowAddLead(false);
        loadLeads();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Add Lead',
        text: error.message || 'Could not create lead. Please try again.',
        confirmButtonColor: '#ef4444',
        background: '#0d0d0d',
        color: '#fff'
      });
    }
  };

  // Update Lead Stage
  const handleUpdateStage = async (lead, newStage) => {
    // If Won, ask for won price
    if (newStage === 'Won') {
      const result = await Swal.fire({
        title: 'Lead Won! 🎉',
        html: `
          <div style="text-align: left; margin-top: 20px;">
            <label style="color: #fff; font-size: 14px; font-weight: 600; margin-bottom: 8px; display: block;">
              Final Deal Price (PKR) *
            </label>
            <input 
              id="won-price" 
              type="number"
              placeholder="Enter final deal price"
              min="0"
              style="
                width: 100%;
                padding: 12px;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(177, 76, 255, 0.3);
                border-radius: 8px;
                color: #fff;
                font-size: 16px;
                font-weight: 600;
              "
            />
            <p style="color: #888; font-size: 12px; margin-top: 8px;">
              Expected Value: PKR ${lead.expectedValue?.toLocaleString()}
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Mark as Won',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        background: '#0d0d0d',
        color: '#fff',
        preConfirm: () => {
          const wonPrice = document.getElementById('won-price').value;
          if (!wonPrice || parseFloat(wonPrice) <= 0) {
            Swal.showValidationMessage('Please enter a valid deal price!');
            return false;
          }
          return { wonPrice: parseFloat(wonPrice) };
        }
      });

      if (!result.isConfirmed) return;

      // Show updating popup
      Swal.fire({
        title: 'Updating Lead...',
        text: 'Please wait while we update the lead status',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: '#0d0d0d',
        color: '#fff'
      });

      try {
        const response = await fetch('/api/leads', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: lead.id,
            stage: newStage,
            wonPrice: result.value.wonPrice,
            updatedByName: employee?.name || 'Employee'
          })
        });

        const data = await response.json();

        if (data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Updated Successfully!',
            text: `Lead marked as ${newStage}`,
            confirmButtonColor: '#10b981',
            background: '#0d0d0d',
            color: '#fff',
            timer: 2000,
            showConfirmButton: true
          });
          loadLeads();
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: error.message,
          confirmButtonColor: '#ef4444',
          background: '#0d0d0d',
          color: '#fff'
        });
      }
    } else {
      // Regular stage update
      // Show updating popup
      Swal.fire({
        title: 'Updating Lead...',
        text: 'Please wait while we update the lead status',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: '#0d0d0d',
        color: '#fff'
      });

      try {
        const response = await fetch('/api/leads', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: lead.id,
            stage: newStage,
            updatedByName: employee?.name || 'Employee'
          })
        });

        const data = await response.json();

        if (data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Updated Successfully!',
            text: `Lead stage changed to ${newStage}`,
            confirmButtonColor: '#10b981',
            background: '#0d0d0d',
            color: '#fff',
            timer: 2000,
            showConfirmButton: true
          });
          loadLeads();
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: error.message,
          confirmButtonColor: '#ef4444',
          background: '#0d0d0d',
          color: '#fff'
        });
      }
    }
  };

  // Get Stage Badge Color
  const getStageBadgeClass = (stage) => {
    const stageMap = {
      'New': 'badge-new',
      'Contacted': 'badge-contacted',
      'Quotation Sent': 'badge-quotation',
      'Negotiation': 'badge-negotiation',
      'Won': 'badge-won',
      'Lost': 'badge-lost'
    };
    return stageMap[stage] || 'badge-new';
  };

  const getPriorityClass = (priority) => {
    const map = {
      'Low': 'priority-low',
      'Medium': 'priority-medium',
      'High': 'priority-high',
      'Urgent': 'priority-urgent'
    };
    return map[priority] || 'priority-medium';
  };

  return (
    <div className="sales-tab-container">
      {/* Stats Overview */}
      <div className="sales-stats-grid">
        <div className="sales-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(177, 76, 255, 0.15)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b14cff" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <div className="stat-info">
            <h4>Total Leads</h4>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>

        <div className="sales-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <h4>Won Deals</h4>
            <p className="stat-number" style={{ color: '#10b981' }}>{stats.won}</p>
          </div>
        </div>

        <div className="sales-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-info">
            <h4>Expected Value</h4>
            <p className="stat-number" style={{ color: '#fbbf24', fontSize: '18px' }}>
              PKR {stats.totalValue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="sales-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <path d="M12 2v20M2 12h20"></path>
            </svg>
          </div>
          <div className="stat-info">
            <h4>Won Value</h4>
            <p className="stat-number" style={{ color: '#22c55e', fontSize: '18px' }}>
              PKR {stats.wonValue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sales-actions">
        <button className="btn-add-lead" onClick={() => setShowAddLead(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Lead
        </button>
      </div>

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="modal-overlay" onClick={() => setShowAddLead(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Lead</h2>
              <button className="modal-close" onClick={() => setShowAddLead(false)}>×</button>
            </div>
            <form onSubmit={handleAddLead} className="lead-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Client Name *</label>
                  <input 
                    type="text" 
                    name="clientName" 
                    placeholder="Enter client full name"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="+92 300 1234567"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Company Name</label>
                  <input 
                    type="text" 
                    name="companyName" 
                    placeholder="Company or organization name"
                  />
                </div>

                <div className="form-group">
                  <label>Service Type *</label>
                  <select name="serviceType" required>
                    <option value="">Select Service</option>
                    <option value="Website Development">Website Development</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="ERP System">ERP System</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="SEO Services">SEO Services</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Custom Software">Custom Software</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Current Stage *</label>
                  <select 
                    name="stage" 
                    defaultValue="New" 
                    required
                    onChange={(e) => {
                      const wonField = document.getElementById('wonPriceField');
                      const wonInput = document.getElementById('wonPriceInput');
                      
                      if (e.target.value === 'Won') {
                        // Show Won Price field and make it required
                        wonField.style.display = 'flex';
                        wonInput.required = true;
                      } else {
                        // Hide Won Price field
                        wonField.style.display = 'none';
                        wonInput.required = false;
                        wonInput.value = '';
                      }
                    }}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Quotation Sent">Quotation Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority" defaultValue="Medium">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Source</label>
                  <select name="source" defaultValue="Direct">
                    <option value="Direct">Direct</option>
                    <option value="Referral">Referral</option>
                    <option value="Website">Website</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Next Follow-up</label>
                  <input 
                    type="date" 
                    name="nextFollowUp"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Conditional Won Price Field - Only shows when stage is Won */}
                <div className="form-group" id="wonPriceField" style={{ display: 'none' }}>
                  <label>Won Price (PKR) *</label>
                  <input 
                    type="number" 
                    name="wonPrice" 
                    placeholder="Final deal price"
                    min="0"
                    id="wonPriceInput"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea 
                    name="notes" 
                    placeholder="Any additional information about this lead..."
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddLead(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="leads-table-container">
        {loading ? (
          <div className="loading-state">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <p>No leads yet. Start by adding your first lead!</p>
          </div>
        ) : (
          <table className="leads-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Expected Value</th>
                <th>Priority</th>
                <th>Stage</th>
                <th>Source</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div className="client-info">
                      <strong>{lead.clientName}</strong>
                      {lead.companyName && <span className="company-name">{lead.companyName}</span>}
                    </div>
                  </td>
                  <td>{lead.serviceType}</td>
                  <td>
                    <strong style={{ color: '#fbbf24' }}>
                      PKR {lead.expectedValue?.toLocaleString()}
                    </strong>
                    {lead.stage === 'Won' && lead.wonPrice && (
                      <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                        Won: PKR {lead.wonPrice.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`priority-badge ${getPriorityClass(lead.priority)}`}>
                      {lead.priority}
                    </span>
                  </td>
                  <td>
                    <select 
                      className={`stage-select ${getStageBadgeClass(lead.stage)}`}
                      value={lead.stage}
                      onChange={(e) => handleUpdateStage(lead, e.target.value)}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Quotation Sent">Quotation Sent</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </td>
                  <td>{lead.source}</td>
                  <td style={{ fontSize: '13px', color: '#888' }}>
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button 
                      className="btn-view-lead"
                      onClick={() => setSelectedLead(lead)}
                      title="View Details"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="modal-content modal-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Lead Details</h2>
              <button className="modal-close" onClick={() => setSelectedLead(null)}>×</button>
            </div>
            <div className="lead-detail-content">
              <div className="detail-section">
                <h3>Client Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <p>{selectedLead.clientName}</p>
                  </div>
                  {selectedLead.companyName && (
                    <div className="detail-item">
                      <label>Company</label>
                      <p>{selectedLead.companyName}</p>
                    </div>
                  )}
                  {selectedLead.email && (
                    <div className="detail-item">
                      <label>Email</label>
                      <p>{selectedLead.email}</p>
                    </div>
                  )}
                  {selectedLead.phone && (
                    <div className="detail-item">
                      <label>Phone</label>
                      <p>{selectedLead.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Lead Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Service Type</label>
                    <p>{selectedLead.serviceType}</p>
                  </div>
                  <div className="detail-item">
                    <label>Expected Value</label>
                    <p style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                      PKR {selectedLead.expectedValue?.toLocaleString()}
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Priority</label>
                    <p>
                      <span className={`priority-badge ${getPriorityClass(selectedLead.priority)}`}>
                        {selectedLead.priority}
                      </span>
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Stage</label>
                    <p>
                      <span className={`stage-badge ${getStageBadgeClass(selectedLead.stage)}`}>
                        {selectedLead.stage}
                      </span>
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Source</label>
                    <p>{selectedLead.source}</p>
                  </div>
                  {selectedLead.stage === 'Won' && selectedLead.wonPrice && (
                    <div className="detail-item">
                      <label>Won Price</label>
                      <p style={{ color: '#10b981', fontWeight: 'bold' }}>
                        PKR {selectedLead.wonPrice.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedLead.notes && (
                <div className="detail-section">
                  <h3>Notes</h3>
                  <p style={{ color: '#ccc', lineHeight: '1.6' }}>{selectedLead.notes}</p>
                </div>
              )}

              {selectedLead.activityLog && selectedLead.activityLog.length > 0 && (
                <div className="detail-section">
                  <h3>Activity Log</h3>
                  <div className="activity-log">
                    {selectedLead.activityLog.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                          </svg>
                        </div>
                        <div className="activity-details">
                          <p className="activity-action">{activity.action}</p>
                          <p className="activity-meta">
                            {activity.performedBy} • {new Date(activity.performedAt).toLocaleString()}
                          </p>
                          {activity.details && (
                            <p className="activity-details-text">{activity.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

