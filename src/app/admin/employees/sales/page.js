'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '../employees.css';

export const dynamic = 'force-dynamic';

function SalesManagementPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeFilter = searchParams.get('employee');

  const [activeTab, setActiveTab] = useState('leads');
  const [leads, setLeads] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [salesEmployees, setSalesEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(employeeFilter || '');
  const [performance, setPerformance] = useState(null);

  const [leadForm, setLeadForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    serviceRequired: '',
    estimatedValue: 0,
    assignedTo: employeeFilter || '',
    status: 'New',
    source: '',
    priority: 'Medium',
    notes: ''
  });

  const [followupForm, setFollowupForm] = useState({
    leadId: '',
    employeeId: employeeFilter || '',
    followupDate: new Date().toISOString().split('T')[0],
    followupTime: '',
    contactMethod: 'Phone',
    outcome: '',
    notes: '',
    nextFollowupDate: ''
  });

  useEffect(() => {
    fetchSalesEmployees();
    fetchLeads();
    fetchFollowups();
    if (selectedEmployee) {
      fetchPerformance(selectedEmployee);
    }
  }, [employeeFilter, selectedEmployee]);

  const fetchSalesEmployees = async () => {
    try {
      const response = await fetch('/api/employees?status=Active');
      const data = await response.json();
      if (data.success) {
        const salesEmps = data.employees.filter(emp => emp.isSalesEmployee);
        setSalesEmployees(salesEmps);
      }
    } catch (error) {
      console.error('Error fetching sales employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const url = employeeFilter 
        ? `/api/employees/sales/leads?employeeId=${employeeFilter}`
        : '/api/employees/sales/leads';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchFollowups = async () => {
    try {
      const url = employeeFilter 
        ? `/api/employees/sales/followups?employeeId=${employeeFilter}`
        : '/api/employees/sales/followups';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setFollowups(data.followups);
      }
    } catch (error) {
      console.error('Error fetching followups:', error);
    }
  };

  const fetchPerformance = async (empId) => {
    try {
      const response = await fetch(`/api/employees/sales/performance?employeeId=${empId}`);
      const data = await response.json();
      
      if (data.success) {
        setPerformance(data.performance);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/employees/sales/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm)
      });

      const data = await response.json();

      if (data.success) {
        alert('Lead created successfully!');
        setShowLeadForm(false);
        fetchLeads();
        resetLeadForm();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Failed to create lead');
    }
  };

  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/employees/sales/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followupForm)
      });

      const data = await response.json();

      if (data.success) {
        alert('Follow-up recorded successfully!');
        setShowFollowupForm(false);
        fetchFollowups();
        resetFollowupForm();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error recording follow-up:', error);
      alert('Failed to record follow-up');
    }
  };

  const handleLeadStatusUpdate = async (leadId, newStatus) => {
    try {
      const response = await fetch('/api/employees/sales/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        fetchLeads();
        if (selectedEmployee) {
          fetchPerformance(selectedEmployee);
        }
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const resetLeadForm = () => {
    setLeadForm({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientCompany: '',
      serviceRequired: '',
      estimatedValue: 0,
      assignedTo: employeeFilter || '',
      status: 'New',
      source: '',
      priority: 'Medium',
      notes: ''
    });
  };

  const resetFollowupForm = () => {
    setFollowupForm({
      leadId: '',
      employeeId: employeeFilter || '',
      followupDate: new Date().toISOString().split('T')[0],
      followupTime: '',
      contactMethod: 'Phone',
      outcome: '',
      notes: '',
      nextFollowupDate: ''
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'New': 'status-badge',
      'Contacted': 'status-badge status-suspended',
      'Interested': 'status-badge status-resigned',
      'Converted': 'status-badge status-active',
      'Lost': 'status-badge status-terminated'
    };
    return statusMap[status] || 'status-badge';
  };

  if (loading) {
    return null; // Global loader will handle this
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Sales Management</h1>
        <div className="header-actions">
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="filter-select"
          >
            <option value="">All Sales Employees</option>
            {salesEmployees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.employeeId})
              </option>
            ))}
          </select>
          {activeTab === 'leads' ? (
            <button className="create-btn" onClick={() => setShowLeadForm(!showLeadForm)}>
              {showLeadForm ? '✕ Cancel' : '+ Add Lead'}
            </button>
          ) : (
            <button className="create-btn" onClick={() => setShowFollowupForm(!showFollowupForm)}>
              {showFollowupForm ? '✕ Cancel' : '+ Add Follow-up'}
            </button>
          )}
        </div>
      </div>

      {/* Performance Dashboard */}
      {performance && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Leads</h3>
            <p className="stat-number">{performance.leads.total}</p>
          </div>
          <div className="stat-card">
            <h3>Converted</h3>
            <p className="stat-number stat-active">{performance.leads.converted}</p>
          </div>
          <div className="stat-card">
            <h3>Conversion Rate</h3>
            <p className="stat-number">{performance.leads.conversionRate}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-number">PKR {performance.revenue.convertedValue.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Total Commission</h3>
            <p className="stat-number">PKR {performance.commission.total.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Target Achievement</h3>
            <p className="stat-number">{performance.target.achievementPercentage}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={activeTab === 'leads' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('leads')}
          >
            📊 Leads ({leads.length})
          </button>
          <button
            className={activeTab === 'followups' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('followups')}
          >
            📞 Follow-ups ({followups.length})
          </button>
        </div>
      </div>

      {/* Lead Form */}
      {showLeadForm && activeTab === 'leads' && (
        <div className="form-modal">
          <form onSubmit={handleLeadSubmit} className="lead-form">
            <h3>Add New Lead</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  value={leadForm.clientName}
                  onChange={(e) => setLeadForm({ ...leadForm, clientName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Client Email</label>
                <input
                  type="email"
                  value={leadForm.clientEmail}
                  onChange={(e) => setLeadForm({ ...leadForm, clientEmail: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Client Phone</label>
                <input
                  type="tel"
                  value={leadForm.clientPhone}
                  onChange={(e) => setLeadForm({ ...leadForm, clientPhone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={leadForm.clientCompany}
                  onChange={(e) => setLeadForm({ ...leadForm, clientCompany: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Service Required</label>
                <input
                  type="text"
                  value={leadForm.serviceRequired}
                  onChange={(e) => setLeadForm({ ...leadForm, serviceRequired: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Estimated Value (PKR)</label>
                <input
                  type="number"
                  value={leadForm.estimatedValue}
                  onChange={(e) => setLeadForm({ ...leadForm, estimatedValue: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Assign To *</label>
                <select
                  value={leadForm.assignedTo}
                  onChange={(e) => setLeadForm({ ...leadForm, assignedTo: e.target.value })}
                  required
                >
                  <option value="">Select Sales Employee</option>
                  {salesEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={leadForm.priority}
                  onChange={(e) => setLeadForm({ ...leadForm, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Source</label>
                <input
                  type="text"
                  value={leadForm.source}
                  onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                  placeholder="Website, Referral, Social Media..."
                />
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowLeadForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Add Lead
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Follow-up Form */}
      {showFollowupForm && activeTab === 'followups' && (
        <div className="form-modal">
          <form onSubmit={handleFollowupSubmit} className="followup-form">
            <h3>Record Follow-up</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Lead *</label>
                <select
                  value={followupForm.leadId}
                  onChange={(e) => setFollowupForm({ ...followupForm, leadId: e.target.value })}
                  required
                >
                  <option value="">Select Lead</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.clientName} - {lead.serviceRequired}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sales Employee *</label>
                <select
                  value={followupForm.employeeId}
                  onChange={(e) => setFollowupForm({ ...followupForm, employeeId: e.target.value })}
                  required
                >
                  <option value="">Select Employee</option>
                  {salesEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Follow-up Date *</label>
                <input
                  type="date"
                  value={followupForm.followupDate}
                  onChange={(e) => setFollowupForm({ ...followupForm, followupDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Follow-up Time</label>
                <input
                  type="time"
                  value={followupForm.followupTime}
                  onChange={(e) => setFollowupForm({ ...followupForm, followupTime: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Contact Method</label>
                <select
                  value={followupForm.contactMethod}
                  onChange={(e) => setFollowupForm({ ...followupForm, contactMethod: e.target.value })}
                >
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>

              <div className="form-group">
                <label>Outcome</label>
                <input
                  type="text"
                  value={followupForm.outcome}
                  onChange={(e) => setFollowupForm({ ...followupForm, outcome: e.target.value })}
                  placeholder="Interested, Call Back Later..."
                />
              </div>

              <div className="form-group">
                <label>Next Follow-up Date</label>
                <input
                  type="date"
                  value={followupForm.nextFollowupDate}
                  onChange={(e) => setFollowupForm({ ...followupForm, nextFollowupDate: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  value={followupForm.notes}
                  onChange={(e) => setFollowupForm({ ...followupForm, notes: e.target.value })}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowFollowupForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Record Follow-up
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leads Tab Content */}
      {activeTab === 'leads' && (
        <div className="employees-table-container">
          {leads.length === 0 ? (
            <div className="no-data"><p>No leads found</p></div>
          ) : (
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Service</th>
                  <th>Value</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <strong>{lead.clientName}</strong>
                      {lead.clientCompany && (
                        <div style={{ fontSize: '0.85em', color: '#666' }}>
                          {lead.clientCompany}
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{lead.clientPhone}</div>
                      <div style={{ fontSize: '0.85em', color: '#666' }}>
                        {lead.clientEmail}
                      </div>
                    </td>
                    <td>{lead.serviceRequired || 'N/A'}</td>
                    <td>PKR {lead.estimatedValue?.toLocaleString() || 0}</td>
                    <td>{lead.assignedToName}</td>
                    <td><span className={`status-badge ${lead.priority === 'High' ? 'status-resigned' : ''}`}>{lead.priority}</span></td>
                    <td>
                      <select
                        value={lead.status}
                        onChange={(e) => handleLeadStatusUpdate(lead.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                    <td>
                      <span className={getStatusClass(lead.status)}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Follow-ups Tab Content */}
      {activeTab === 'followups' && (
        <div className="employees-table-container">
          {followups.length === 0 ? (
            <div className="no-data"><p>No follow-ups found</p></div>
          ) : (
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Employee</th>
                  <th>Date & Time</th>
                  <th>Contact Method</th>
                  <th>Outcome</th>
                  <th>Next Follow-up</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {followups.map((followup) => (
                  <tr key={followup.id}>
                    <td><strong>{followup.clientName}</strong></td>
                    <td>{followup.employeeName}</td>
                    <td>
                      {new Date(followup.followupDate).toLocaleDateString()}
                      {followup.followupTime && (
                        <div style={{ fontSize: '0.85em', color: '#666' }}>
                          {followup.followupTime}
                        </div>
                      )}
                    </td>
                    <td>{followup.contactMethod}</td>
                    <td>{followup.outcome || '-'}</td>
                    <td>
                      {followup.nextFollowupDate 
                        ? new Date(followup.nextFollowupDate).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td>{followup.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}


export default function SalesManagementPage() {
  return (
    <Suspense fallback={
      <div className="employees-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    }>
      <SalesManagementPageContent />
    </Suspense>
  );
}
