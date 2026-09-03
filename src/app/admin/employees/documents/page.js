'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '../employees.css';

export const dynamic = 'force-dynamic';

function DocumentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeFilter = searchParams.get('employee');

  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: employeeFilter || '',
    documentType: 'CV',
    documentName: '',
    documentUrl: '',
    expiryDate: '',
    issueDate: '',
    issuedBy: '',
    notes: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchDocuments();
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

  const fetchDocuments = async () => {
    try {
      const url = employeeFilter 
        ? `/api/employees/documents?employeeId=${employeeFilter}`
        : '/api/employees/documents';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/employees/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Document uploaded successfully!');
        setShowForm(false);
        fetchDocuments();
        resetForm();
      } else {
        alert(data.message || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/employees/documents?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Document deleted successfully');
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: employeeFilter || '',
      documentType: 'CV',
      documentName: '',
      documentUrl: '',
      expiryDate: '',
      issueDate: '',
      issuedBy: '',
      notes: ''
    });
  };

  const getExpiryStatus = (doc) => {
    if (!doc.expiryDate) return null;
    
    if (doc.isExpired) {
      return <span className="status-badge status-terminated">Expired</span>;
    } else if (doc.daysUntilExpiry <= 30) {
      return <span className="status-badge status-resigned">Expires in {doc.daysUntilExpiry} days</span>;
    } else {
      return <span className="status-badge status-active">Valid</span>;
    }
  };

  if (loading) {
    return (
      <div className="employees-container">
        <div className="loading-spinner">Loading documents...</div>
      </div>
    );
  }

  const expiredDocs = documents.filter(doc => doc.isExpired).length;
  const expiringSoon = documents.filter(doc => !doc.isExpired && doc.daysUntilExpiry <= 30).length;

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Document Management</h1>
        <button className="create-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Upload Document'}
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Documents</h3>
          <p className="stat-number">{documents.length}</p>
        </div>
        <div className="stat-card">
          <h3>Expired</h3>
          <p className="stat-number stat-danger">{expiredDocs}</p>
        </div>
        <div className="stat-card">
          <h3>Expiring Soon</h3>
          <p className="stat-number stat-warning">{expiringSoon}</p>
        </div>
      </div>

      {showForm && (
        <div className="form-modal">
          <form onSubmit={handleSubmit} className="document-form">
            <h3>Upload Document</h3>
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
                <label>Document Type *</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  required
                >
                  <option value="CV">CV</option>
                  <option value="CNIC">CNIC</option>
                  <option value="Joining Letter">Joining Letter</option>
                  <option value="Employment Agreement">Employment Agreement</option>
                  <option value="Educational Certificate">Educational Certificate</option>
                  <option value="Experience Letter">Experience Letter</option>
                  <option value="Salary Agreement">Salary Agreement</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Document Name</label>
                <input
                  type="text"
                  value={formData.documentName}
                  onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                  placeholder="e.g., Muhammad Aqdas - CV"
                />
              </div>

              <div className="form-group">
                <label>Document URL *</label>
                <input
                  type="url"
                  value={formData.documentUrl}
                  onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                  required
                />
              </div>

              <div className="form-group">
                <label>Issue Date</label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Issued By</label>
                <input
                  type="text"
                  value={formData.issuedBy}
                  onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Upload Document
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="employees-table-container">
        {documents.length === 0 ? (
          <div className="no-data">
            <p>No documents found</p>
          </div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Document Type</th>
                <th>Document Name</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <strong>{doc.employeeName}</strong>
                    <div style={{ fontSize: '0.85em', color: '#666' }}>
                      {doc.employeeIdNumber}
                    </div>
                  </td>
                  <td>{doc.documentType}</td>
                  <td>{doc.documentName || doc.documentType}</td>
                  <td>{doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{getExpiryStatus(doc)}</td>
                  <td>
                    <div className="action-buttons">
                      <a
                        href={doc.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-btn"
                        title="View Document"
                      >
                        👁️
                      </a>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(doc.id)}
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


export default function DocumentsPage() {
  return (
    <Suspense fallback={
      <div className="employees-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    }>
      <DocumentsPageContent />
    </Suspense>
  );
}
