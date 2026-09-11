'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import './quotations.css';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiCopy, 
  FiEye, 
  FiDownload, 
  FiSend,
  FiSearch,
  FiFilter,
  FiArrowLeft
} from 'react-icons/fi';

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [searchTerm, statusFilter, quotations]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quotations');
      const result = await response.json();
      
      if (result.success) {
        setQuotations(result.data);
        setFilteredQuotations(result.data);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch quotations'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterQuotations = () => {
    let filtered = [...quotations];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.clientCompany?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }

    setFilteredQuotations(filtered);
  };

  const handleDelete = async (id, quotationNumber) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete quotation ${quotationNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/quotations?id=${id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          Swal.fire('Deleted!', 'Quotation deleted successfully', 'success');
          fetchQuotations();
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to delete quotation', 'error');
      }
    }
  };

  const handleDuplicate = async (quotation) => {
    try {
      const duplicateData = {
        ...quotation,
        status: 'Draft',
        issueDate: new Date().toISOString().split('T')[0],
        validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      delete duplicateData.id;
      delete duplicateData.quotationNumber;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;

      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire('Success', 'Quotation duplicated successfully', 'success');
        fetchQuotations();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to duplicate quotation', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Draft: 'bg-gray-100 text-gray-800',
      Sent: 'bg-blue-100 text-blue-800',
      Accepted: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Expired: 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.Draft}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return null; // Global loader will handle this
  }

  return (
    <div className="quotations-page">
      <div className="quotations-header">
        <div className="header-left">
          <button 
            className="btn-back"
            onClick={() => router.push('/admin/dashboard')}
            style={{ marginBottom: '10px' }}
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
          <h1>Quotation Management</h1>
          <p>Manage all your client quotations</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => router.push('/admin/quotations/create')}
        >
          <FiPlus /> Create Quotation
        </button>
      </div>

      <div className="quotations-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by quotation number, client name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <FiFilter className="filter-icon" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="quotations-stats">
        <div className="stat-card">
          <h3>{quotations.length}</h3>
          <p>Total Quotations</p>
        </div>
        <div className="stat-card">
          <h3>{quotations.filter(q => q.status === 'Draft').length}</h3>
          <p>Draft</p>
        </div>
        <div className="stat-card">
          <h3>{quotations.filter(q => q.status === 'Sent').length}</h3>
          <p>Sent</p>
        </div>
        <div className="stat-card">
          <h3>{quotations.filter(q => q.status === 'Accepted').length}</h3>
          <p>Accepted</p>
        </div>
      </div>

      <div className="quotations-table-container">
        {filteredQuotations.length === 0 ? (
          <div className="empty-state">
            <p>No quotations found</p>
            <button 
              className="btn-primary"
              onClick={() => router.push('/admin/quotations/create')}
            >
              <FiPlus /> Create First Quotation
            </button>
          </div>
        ) : (
          <table className="quotations-table">
            <thead>
              <tr>
                <th>Quotation #</th>
                <th>Client</th>
                <th>Issue Date</th>
                <th>Valid Until</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map((quotation) => (
                <tr key={quotation.id}>
                  <td>
                    <div>
                      <strong style={{display: 'block', marginBottom: '4px'}}>{quotation.quotationNumber}</strong>
                      {quotation.quotationTitle && (
                        <span style={{
                          fontSize: '11px',
                          color: '#b14cff',
                          display: 'block',
                          fontWeight: '500'
                        }}>
                          {quotation.quotationTitle}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="client-info">
                      <strong>{quotation.clientName}</strong>
                      <span>{quotation.clientEmail}</span>
                      {quotation.clientCompany && (
                        <span className="company">{quotation.clientCompany}</span>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(quotation.issueDate)}</td>
                  <td>{formatDate(quotation.validityDate)}</td>
                  <td>
                    <strong>{formatCurrency(quotation.grandTotal, quotation.currency)}</strong>
                  </td>
                  <td>{getStatusBadge(quotation.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-view"
                        title="Preview"
                        onClick={() => router.push(`/admin/quotations/preview/${quotation.id}`)}
                      >
                        <FiEye />
                      </button>
                      <button
                        className="btn-icon btn-edit"
                        title="Edit"
                        onClick={() => router.push(`/admin/quotations/edit/${quotation.id}`)}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="btn-icon btn-duplicate"
                        title="Duplicate"
                        onClick={() => handleDuplicate(quotation)}
                      >
                        <FiCopy />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        title="Delete"
                        onClick={() => handleDelete(quotation.id, quotation.quotationNumber)}
                      >
                        <FiTrash2 />
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
