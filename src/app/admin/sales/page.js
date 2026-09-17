'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import './sales.css';

export default function AdminSalesPage() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');

  useEffect(() => {
    loadLeads();
    
    // Auto refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadLeads();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterLeads();
  }, [searchTerm, stageFilter, priorityFilter, employeeFilter, leads]);

  const loadLeads = async () => {
    try {
      const response = await fetch('/api/leads');
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

  const filterLeads = () => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Stage filter
    if (stageFilter !== 'All') {
      filtered = filtered.filter(lead => lead.stage === stageFilter);
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(lead => lead.priority === priorityFilter);
    }

    // Employee filter
    if (employeeFilter !== 'All') {
      filtered = filtered.filter(lead => lead.createdBy === employeeFilter);
    }

    setFilteredLeads(filtered);
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
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.stage === 'Won').length / leads.length) * 100).toFixed(1) : 0
  };

  // Get unique employees
  const employees = [...new Set(leads.map(l => ({ id: l.createdBy, name: l.createdByName })))];

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

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
  };

  if (loading) {
    return null; // Global loader will handle this
  }

  return (
    <div className="admin-sales-page">
      {/* Header */}
      <div className="sales-header">
        <div className="header-left">
          <button 
            className="btn-back"
            onClick={() => router.push('/admin/dashboard')}
          >
            ← Back to Dashboard
          </button>
          <h1>Sales & Lead Management</h1>
          <p>Track all leads and sales activities across the team</p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="sales-stats-overview">
        <div className="stat-card stat-total">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Leads</h3>
            <p className="stat-number">{stats.total}</p>
            <div className="stat-breakdown">
              <span>New: {stats.new}</span>
              <span>Contacted: {stats.contacted}</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-pipeline">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>In Pipeline</h3>
            <p className="stat-number">{stats.quotation + stats.negotiation}</p>
            <div className="stat-breakdown">
              <span>Quotation: {stats.quotation}</span>
              <span>Negotiation: {stats.negotiation}</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-won">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Won Deals</h3>
            <p className="stat-number">{stats.won}</p>
            <div className="stat-breakdown">
              <span>Conversion: {stats.conversionRate}%</span>
              <span>Lost: {stats.lost}</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-value">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Value</h3>
            <p className="stat-number stat-amount">PKR {stats.totalValue.toLocaleString()}</p>
            <div className="stat-breakdown">
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                Won: PKR {stats.wonValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sales-filters">
        <div className="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search by client name, company, email, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          <option value="All">All Stages</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Quotation Sent">Quotation Sent</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>

        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>

        <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
          <option value="All">All Employees</option>
          {employees.map((emp, index) => (
            <option key={index} value={emp.id}>{emp.name}</option>
          ))}
        </select>

        <button className="btn-refresh" onClick={loadLeads} title="Refresh Data">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
      </div>

      {/* Results Info */}
      <div className="results-info">
        Showing {filteredLeads.length} of {leads.length} leads
      </div>

      {/* Leads Table */}
      <div className="sales-table-container">
        {filteredLeads.length === 0 ? (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <p>No leads found matching your filters</p>
          </div>
        ) : (
          <table className="sales-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Expected Value</th>
                <th>Priority</th>
                <th>Stage</th>
                <th>Source</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} onClick={() => handleViewLead(lead)} style={{ cursor: 'pointer' }}>
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
                      <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: 'bold' }}>
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
                    <span className={`stage-badge ${getStageBadgeClass(lead.stage)}`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td>{lead.source}</td>
                  <td>
                    <div className="employee-info">
                      <strong>{lead.createdByName}</strong>
                      <span style={{ fontSize: '12px', color: '#888' }}>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: '#888' }}>
                    {new Date(lead.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    <button 
                      className="btn-view"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewLead(lead);
                      }}
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

      {/* Lead Detail Popup */}
      {selectedLead && (
        <div className="popup-overlay" onClick={() => setSelectedLead(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div>
                <h2>Lead Details</h2>
                <p className="lead-id">Created by {selectedLead.createdByName} on {new Date(selectedLead.createdAt).toLocaleDateString()}</p>
              </div>
              <button className="popup-close" onClick={() => setSelectedLead(null)}>×</button>
            </div>

            <div className="popup-body">
              {/* Status Bar */}
              <div className="status-bar">
                <div className="status-item">
                  <span className={`stage-badge-large ${getStageBadgeClass(selectedLead.stage)}`}>
                    {selectedLead.stage}
                  </span>
                </div>
                <div className="status-item">
                  <span className={`priority-badge-large ${getPriorityClass(selectedLead.priority)}`}>
                    {selectedLead.priority} Priority
                  </span>
                </div>
                {selectedLead.stage === 'Won' && selectedLead.wonDate && (
                  <div className="status-item">
                    <span className="won-date">
                      Won on {new Date(selectedLead.wonDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Client Information */}
              <div className="detail-section">
                <h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Client Information
                </h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Client Name</label>
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
                      <p>
                        <a href={`mailto:${selectedLead.email}`} style={{ color: '#b14cff' }}>
                          {selectedLead.email}
                        </a>
                      </p>
                    </div>
                  )}
                  {selectedLead.phone && (
                    <div className="detail-item">
                      <label>Phone</label>
                      <p>
                        <a href={`tel:${selectedLead.phone}`} style={{ color: '#b14cff' }}>
                          {selectedLead.phone}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Information */}
              <div className="detail-section">
                <h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Lead Information
                </h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Service Type</label>
                    <p>{selectedLead.serviceType}</p>
                  </div>
                  <div className="detail-item">
                    <label>Expected Value</label>
                    <p style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '18px' }}>
                      PKR {selectedLead.expectedValue?.toLocaleString()}
                    </p>
                  </div>
                  {selectedLead.stage === 'Won' && selectedLead.wonPrice && (
                    <div className="detail-item">
                      <label>Won Price</label>
                      <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: '18px' }}>
                        PKR {selectedLead.wonPrice.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>Source</label>
                    <p>{selectedLead.source}</p>
                  </div>
                  {selectedLead.nextFollowUp && (
                    <div className="detail-item">
                      <label>Next Follow-up</label>
                      <p>{new Date(selectedLead.nextFollowUp).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div className="detail-section">
                  <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    Notes
                  </h3>
                  <p style={{ color: '#ccc', lineHeight: '1.8', fontSize: '14px' }}>
                    {selectedLead.notes}
                  </p>
                </div>
              )}

              {/* Activity Log */}
              {selectedLead.activityLog && selectedLead.activityLog.length > 0 && (
                <div className="detail-section">
                  <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    Activity Timeline
                  </h3>
                  <div className="activity-timeline">
                    {selectedLead.activityLog.map((activity, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <p className="timeline-action">{activity.action}</p>
                          <p className="timeline-details">{activity.details}</p>
                          <p className="timeline-meta">
                            {activity.performedBy} • {new Date(activity.performedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
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
