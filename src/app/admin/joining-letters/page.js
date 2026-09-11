'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiSearch,
  FiFilter,
  FiArrowLeft,
  FiFileText,
} from 'react-icons/fi';
import './joining-letters.css';

const STATUS_MAP = {
  Draft:    'jl-badge jl-badge-draft',
  Sent:     'jl-badge jl-badge-sent',
  Accepted: 'jl-badge jl-badge-accepted',
  Rejected: 'jl-badge jl-badge-rejected',
};

export default function JoiningLettersPage() {
  const router = useRouter();
  const [letters, setLetters]           = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => { fetchLetters(); }, []);

  useEffect(() => {
    let data = [...letters];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter(l =>
        l.letterNumber?.toLowerCase().includes(q) ||
        l.employeeName?.toLowerCase().includes(q) ||
        l.position?.toLowerCase().includes(q) ||
        l.department?.toLowerCase().includes(q) ||
        l.employeeEmail?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      data = data.filter(l => l.status === statusFilter);
    }
    setFiltered(data);
  }, [searchTerm, statusFilter, letters]);

  const fetchLetters = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/joining-letters');
      const data = await res.json();
      if (data.success) {
        setLetters(data.data);
        setFiltered(data.data);
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch letters', background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, letterNumber) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete joining letter ${letterNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#555',
      confirmButtonText: 'Yes, delete!',
      background: '#0d0d0d',
      color: '#fff',
    });

    if (!result.isConfirmed) return;

    try {
      const res  = await fetch(`/api/joining-letters?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Letter deleted successfully', timer: 1800, background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
        fetchLetters();
      } else throw new Error(data.message);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Delete failed', background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
    }
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const stats = [
    { label: 'Total Letters',  val: letters.length },
    { label: 'Draft',          val: letters.filter(l => l.status === 'Draft').length },
    { label: 'Sent',           val: letters.filter(l => l.status === 'Sent').length },
    { label: 'Accepted',       val: letters.filter(l => l.status === 'Accepted').length },
  ];

  if (loading) {
    return null; // Global loader will handle this
  }

  return (
    <div className="jl-page">

      {/* ── Header ── */}
      <div className="jl-header">
        <div className="jl-header-left">
          <button className="jl-btn-back" onClick={() => router.push('/admin/dashboard')}>
            <FiArrowLeft /> Back to Dashboard
          </button>
          <h1>Joining Letters</h1>
          <p>Manage employee joining letters</p>
        </div>
        <button className="jl-btn-primary" onClick={() => router.push('/admin/joining-letters/create')}>
          <FiPlus /> Create Letter
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="jl-filters">
        <div className="jl-search-box">
          <FiSearch className="jl-search-icon" />
          <input
            type="text"
            placeholder="Search by name, position, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="jl-filter-box">
          <FiFilter className="jl-filter-icon" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="jl-stats">
        {stats.map((s, i) => (
          <div key={i} className="jl-stat-card">
            <h3>{s.val}</h3>
            <p>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="jl-table-container">
        {filtered.length === 0 ? (
          <div className="jl-empty">
            <FiFileText size={48} style={{ color: '#333' }} />
            <p>No joining letters found</p>
            <button className="jl-btn-primary" onClick={() => router.push('/admin/joining-letters/create')}>
              <FiPlus /> Create First Letter
            </button>
          </div>
        ) : (
          <table className="jl-table">
            <thead>
              <tr>
                <th>Letter #</th>
                <th>Employee</th>
                <th>Position</th>
                <th>Joining Date</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td><strong style={{ color: '#e0aaff' }}>{l.letterNumber}</strong></td>
                  <td>
                    <div className="jl-employee-info">
                      <strong>{l.employeeName}</strong>
                      <span>{l.employeeEmail}</span>
                      {l.department && <span className="dept">{l.department}</span>}
                    </div>
                  </td>
                  <td>{l.position}</td>
                  <td>{formatDate(l.joiningDate)}</td>
                  <td>
                    {(!l.compensationType || l.compensationType === 'Fixed Salary') && (
                      <>
                        <strong style={{ color: '#28c840' }}>
                          {l.currency || 'PKR'} {Number(l.salary || 0).toLocaleString('en-PK')}
                        </strong>
                        {l.salaryType && <div style={{ fontSize: 11, color: '#666' }}>{l.salaryType}</div>}
                      </>
                    )}
                    {l.compensationType === 'Commission Only' && (
                      <>
                        <strong style={{ color: '#61dafb' }}>
                          {l.commissionRate}{['Revenue %','Profit %'].includes(l.commissionBase) ? '%' : ` ${l.currency}`}
                        </strong>
                        <div style={{ fontSize: 11, color: '#666' }}>Commission · {l.commissionBase}</div>
                      </>
                    )}
                    {l.compensationType === 'Salary + Commission' && (
                      <>
                        <strong style={{ color: '#ffd43b' }}>
                          {l.currency || 'PKR'} {Number(l.salary || 0).toLocaleString('en-PK')}
                        </strong>
                        <div style={{ fontSize: 11, color: '#61dafb' }}>
                          + {l.commissionRate}{['Revenue %','Profit %'].includes(l.commissionBase) ? '%' : ` ${l.currency}`} commission
                        </div>
                      </>
                    )}
                  </td>
                  <td>
                    <span className={STATUS_MAP[l.status] || 'jl-badge jl-badge-draft'}>
                      {l.status || 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className="jl-actions">
                      <button
                        className="jl-btn-icon jl-btn-view"
                        title="Preview"
                        onClick={() => router.push(`/admin/joining-letters/preview/${l.id}`)}
                      >
                        <FiEye />
                      </button>
                      <button
                        className="jl-btn-icon jl-btn-edit"
                        title="Edit"
                        onClick={() => router.push(`/admin/joining-letters/edit/${l.id}`)}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="jl-btn-icon jl-btn-delete"
                        title="Delete"
                        onClick={() => handleDelete(l.id, l.letterNumber)}
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
