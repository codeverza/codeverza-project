'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiUsers, FiBriefcase } from 'react-icons/fi';
import '../quotations.css';

const STORAGE_KEY = 'quotation_create_draft';

const defaultFormData = {
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  clientCompany: '',
  clientAddress: '',
  quotationTitle: '', // Internal reference name
  issueDate: new Date().toISOString().split('T')[0],
  validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  companyEmail: 'info@codeverza.com',
  companyPhone: '+92 325 1507557',
  companyWebsite: 'www.codeverza.com',
  services: [
    {
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      billingCycle: 'One-Time',
      total: 0
    }
  ],
  discount: 0,
  tax: 0,
  currency: 'PKR',
  paymentTerms: '50% advance, 50% on completion',
  projectTimeline: '2-4 weeks',
  notes: '',
  termsAndConditions: 'This quotation is valid for 30 days from the issue date.\nPayment terms must be agreed upon before project commencement.\nPrices are subject to change without notice after validity period.',
  status: 'Draft',
  isEmployeeQuotation: false,
};

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveDraft(data, isEmp) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, isEmployeeQuotation: isEmp }));
  } catch {}
}

function clearDraft() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
}

export default function CreateQuotationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Always start with server-safe defaults — sessionStorage causes hydration mismatch
  const [formData, setFormData] = useState({ ...defaultFormData });
  const [isEmployeeQuotation, setIsEmployeeQuotation] = useState(false);
  const [mounted, setMounted] = useState(false);

  const serviceTemplates = [
    { 
      name: 'Website Development', 
      description: 'Custom website design and development',
      price: 50000,
      billingCycle: 'One-Time'
    },
    { 
      name: 'Domain Registration', 
      description: '.com domain registration',
      price: 1500,
      billingCycle: 'Annually'
    },
    { 
      name: 'Web Hosting', 
      description: 'Shared hosting with SSL',
      price: 2000,
      billingCycle: 'Annually'
    },
    { 
      name: 'Business Email', 
      description: 'Professional email hosting',
      price: 500,
      billingCycle: 'Monthly'
    },
    { 
      name: 'SEO Optimization', 
      description: 'On-page and technical SEO',
      price: 15000,
      billingCycle: 'One-Time'
    },
    { 
      name: 'Maintenance & Support', 
      description: 'Monthly website maintenance',
      price: 5000,
      billingCycle: 'Monthly'
    }
  ];

  const billingCycles = ['One-Time', 'Monthly', 'Half-Yearly', 'Annually', '2 Years'];

  // After mount (client only) — restore draft, then enable auto-save
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setFormData(draft);
      setIsEmployeeQuotation(draft.isEmployeeQuotation ?? false);
    }
    setMounted(true);
  }, []);

  // Auto-save only after mount — prevents overwriting draft with server defaults
  useEffect(() => {
    if (!mounted) return;
    saveDraft(formData, isEmployeeQuotation);
  }, [formData, isEmployeeQuotation, mounted]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleType = (type) => {
    const emp = type === 'employee';
    setIsEmployeeQuotation(emp);
    setFormData(prev => ({
      ...prev,
      isEmployeeQuotation: emp,
      ...(emp ? {
        clientName: 'Employee Quotation',
        clientEmail: 'employee@codeverza.com',
        clientPhone: '',
        clientCompany: '',
        clientAddress: '',
        // Clear dates for employee mode — they are optional
        issueDate: '',
        validityDate: '',
      } : {
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientCompany: '',
        clientAddress: '',
        // Restore default dates for client mode
        issueDate: new Date().toISOString().split('T')[0],
        validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    }));
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.services];
    newServices[index][field] = value;
    
    // Calculate service total
    if (field === 'quantity' || field === 'price') {
      newServices[index].total = newServices[index].quantity * newServices[index].price;
    }
    
    setFormData(prev => ({
      ...prev,
      services: newServices
    }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [
        ...prev.services,
        { 
          name: '', 
          description: '', 
          quantity: 1, 
          price: 0, 
          currency: formData.currency,
          billingCycle: 'One-Time',
          total: 0 
        }
      ]
    }));
  };

  const removeService = (index) => {
    if (formData.services.length > 1) {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== index)
      }));
    }
  };

  const applyServiceTemplate = (index, template) => {
    handleServiceChange(index, 'name', template.name);
    handleServiceChange(index, 'description', template.description);
    handleServiceChange(index, 'price', template.price);
    handleServiceChange(index, 'billingCycle', template.billingCycle);
    handleServiceChange(index, 'quantity', 1);
  };

  const calculateSubtotal = () => {
    return formData.services.reduce((sum, service) => {
      return sum + (service.quantity * service.price);
    }, 0);
  };

  const calculateCurrencyTotals = () => {
    return formData.services.reduce((totals, service) => {
      const currency = service.currency || formData.currency;
      totals[currency] = (totals[currency] || 0) + (service.quantity * service.price);
      return totals;
    }, {});
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * formData.discount) / 100;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    const taxableAmount = subtotal - discountAmount;
    return (taxableAmount * formData.tax) / 100;
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK').format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client validation only for non-employee quotations
    if (!isEmployeeQuotation) {
      if (!formData.clientName?.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Client Name',
          text: 'Please enter the client name',
          background: '#0d0d0d',
          color: '#fff',
          confirmButtonColor: '#b14cff'
        });
        return;
      }

      if (!formData.clientEmail?.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Client Email',
          text: 'Please enter the client email address',
          background: '#0d0d0d',
          color: '#fff',
          confirmButtonColor: '#b14cff'
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.clientEmail)) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Email',
          text: 'Please enter a valid email address',
          background: '#0d0d0d',
          color: '#fff',
          confirmButtonColor: '#b14cff'
        });
        return;
      }
    }

    // Check if at least one service is properly filled
    const validServices = formData.services.filter(s => s.name?.trim() && s.price >= 0);
    
    if (validServices.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Valid Services',
        text: 'Please add at least one service with a name (price can be 0 for FREE services)',
        background: '#0d0d0d',
        color: '#fff',
        confirmButtonColor: '#b14cff'
      });
      return;
    }

    // Check each service for incomplete data
    for (let i = 0; i < formData.services.length; i++) {
      const service = formData.services[i];
      if (service.name?.trim() && service.price < 0) {
        Swal.fire({
          icon: 'warning',
          title: `Invalid Service #${i + 1}`,
          text: `Service "${service.name}" cannot have a negative price. Use 0 for FREE services.`,
          background: '#0d0d0d',
          color: '#fff',
          confirmButtonColor: '#b14cff'
        });
        return;
      }
      if (!service.name?.trim() && service.price > 0) {
        Swal.fire({
          icon: 'warning',
          title: `Missing Service Name`,
          text: `Service #${i + 1} has a price but no name. Please add a service name.`,
          background: '#0d0d0d',
          color: '#fff',
          confirmButtonColor: '#b14cff'
        });
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        clearDraft(); // Remove saved draft after successful submit
        Swal.fire({
          icon: 'success',
          title: 'Success! ✅',
          text: 'Quotation created successfully',
          background: '#0d0d0d',
          color: '#fff',
          confirmButtonColor: '#b14cff',
          iconColor: '#28c840',
          timer: 2000
        });
        router.push('/admin/quotations');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error creating quotation:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error ❌',
        text: error.message || 'Failed to create quotation. Please try again.',
        background: '#0d0d0d',
        color: '#fff',
        confirmButtonColor: '#b14cff'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quotation-form-page">
      {/* Wait for client-side mount before rendering form to avoid hydration/toggle mismatch */}
      {!mounted && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}
      {mounted && (
        <>
          <div className="form-header">
            <button
              className="btn-back"
              onClick={() => router.push('/admin/quotations')}
            >
              <FiArrowLeft /> Back to Quotations
            </button>
            <h1>Create New Quotation</h1>

            {/* Quotation Type Toggle */}
            <div className="quotation-type-toggle">
              <button
                type="button"
                className={`type-btn ${!isEmployeeQuotation ? 'active' : ''}`}
                onClick={() => handleToggleType('client')}
              >
                <FiBriefcase /> Client Quotation
              </button>
              <button
                type="button"
                className={`type-btn ${isEmployeeQuotation ? 'active' : ''}`}
                onClick={() => handleToggleType('employee')}
              >
                <FiUsers /> Employee Quotation
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="quotation-form">
        {/* Company Info Section — only for Employee Quotation */}
        {isEmployeeQuotation && (
          <div className="form-section">
            <h2>Company Info (Header &amp; Footer mein ayega)</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Company Email</label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleInputChange}
                  placeholder="info@codeverza.com"
                />
              </div>

              <div className="form-group">
                <label>Company Phone</label>
                <input
                  type="tel"
                  name="companyPhone"
                  value={formData.companyPhone}
                  onChange={handleInputChange}
                  placeholder="+92 325 1507557"
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="text"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleInputChange}
                  placeholder="www.codeverza.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Client Details Section — only for Client Quotation */}
        {!isEmployeeQuotation && (
          <div className="form-section">
            <h2>Client Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter client name"
                />
              </div>

              <div className="form-group">
                <label>Client Email *</label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="client@example.com"
                />
              </div>

              <div className="form-group">
                <label>Client Phone</label>
                <input
                  type="tel"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  placeholder="+92 300 1234567"
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="clientCompany"
                  value={formData.clientCompany}
                  onChange={handleInputChange}
                  placeholder="Company name (optional)"
                />
              </div>

              <div className="form-group full-width">
                <label>Client Address</label>
                <textarea
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Full address (optional)"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quotation Details Section */}
        <div className="form-section">
          <h2>Quotation Details</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Quotation Title <span style={{fontSize:'11px',color:'#aaa'}}>(for internal reference only)</span></label>
              <input
                type="text"
                name="quotationTitle"
                value={formData.quotationTitle}
                onChange={handleInputChange}
                placeholder="e.g., HMS Visuals & Co., ABC Company Project, etc."
              />
            </div>

            <div className="form-group">
              <label>Issue Date{!isEmployeeQuotation ? ' *' : <span style={{fontSize:'11px',color:'#aaa'}}> (optional)</span>}</label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleInputChange}
                required={!isEmployeeQuotation}
              />
            </div>

            <div className="form-group">
              <label>Valid Until{!isEmployeeQuotation ? ' *' : <span style={{fontSize:'11px',color:'#aaa'}}> (optional)</span>}</label>
              <input
                type="date"
                name="validityDate"
                value={formData.validityDate}
                onChange={handleInputChange}
                required={!isEmployeeQuotation}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>Services</h2>
            <button type="button" className="btn-add" onClick={addService}>
              <FiPlus /> Add Service
            </button>
          </div>

          {formData.services.map((service, index) => (
            <div key={index} className="service-item">
              <div className="service-header">
                <h3>Service #{index + 1}</h3>
                {formData.services.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeService(index)}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>

              <div className="service-template">
                <label>Quick Select:</label>
                <select 
                  onChange={(e) => {
                    const template = serviceTemplates[e.target.value];
                    if (template) applyServiceTemplate(index, template);
                  }}
                  value=""
                >
                  <option value="">Select a template...</option>
                  {serviceTemplates.map((template, i) => (
                    <option key={i} value={i}>{template.name}</option>
                  ))}
                </select>
              </div>

              <div className="service-grid">
                <div className="form-group">
                  <label>Service Name *</label>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                    required
                    placeholder="e.g., Website Development"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={service.description}
                    onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    rows="2"
                    placeholder="Service description..."
                  />
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    value={service.quantity}
                    onChange={(e) => handleServiceChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price ({service.currency || formData.currency}) *</label>
                  <div className="price-control">
                    <input
                      type="number"
                      value={service.price}
                      onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                    <select value={service.currency || formData.currency} onChange={(e) => handleServiceChange(index, 'currency', e.target.value)} aria-label="Price currency">
                      <option value="PKR">PKR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Billing Cycle</label>
                  <select
                    value={service.billingCycle}
                    onChange={(e) => handleServiceChange(index, 'billingCycle', e.target.value)}
                  >
                    {billingCycles.map(cycle => (
                      <option key={cycle} value={cycle}>{cycle}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Total</label>
                  <input
                    type="text"
                    value={`${service.currency || formData.currency} ${formatCurrency(service.quantity * service.price)}`}
                    readOnly
                    className="readonly"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Summary — hidden for Employee Quotation */}
        {!isEmployeeQuotation && (
        <div className="form-section pricing-summary">
          <h2>Pricing Summary</h2>
          <div className="pricing-grid">
            <div className="form-group">
              <label>Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Tax (%)</label>
              <input
                type="number"
                name="tax"
                value={formData.tax}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <div className="summary-table">
            {Object.entries(calculateCurrencyTotals()).map(([currency, subtotal]) => {
              const discount = (subtotal * formData.discount) / 100;
              const tax = ((subtotal - discount) * formData.tax) / 100;
              return (
                <div key={currency} className="currency-summary-group">
                  <div className="summary-row"><span>{currency} Subtotal:</span><strong>{currency} {formatCurrency(subtotal)}</strong></div>
                  {formData.discount > 0 && <div className="summary-row discount"><span>{currency} Discount ({formData.discount}%):</span><strong>- {currency} {formatCurrency(discount)}</strong></div>}
                  {formData.tax > 0 && <div className="summary-row"><span>{currency} Tax ({formData.tax}%):</span><strong>{currency} {formatCurrency(tax)}</strong></div>}
                  <div className="summary-row total"><span>{currency} Grand Total:</span><strong>{currency} {formatCurrency(subtotal - discount + tax)}</strong></div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Additional Information */}
        <div className="form-section">
          <h2>Additional Information</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Payment Terms</label>
              <textarea
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                rows="2"
                placeholder="e.g., 50% advance, 50% on completion"
              />
            </div>

            <div className="form-group full-width">
              <label>Project Timeline</label>
              <textarea
                name="projectTimeline"
                value={formData.projectTimeline}
                onChange={handleInputChange}
                rows="3"
                placeholder="e.g., 2-4 weeks&#10;Week 1-2: Design&#10;Week 3-4: Development"
              />
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any additional notes or special instructions..."
              />
            </div>

            <div className="form-group full-width">
              <label>Terms & Conditions</label>
              <textarea
                name="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={handleInputChange}
                rows="4"
                placeholder="Terms and conditions..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => { clearDraft(); router.push('/admin/quotations'); }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span> Creating...
              </>
            ) : (
              <>
                <FiSave /> Create Quotation
              </>
            )}
          </button>
        </div>
          </form>
        </>
      )}
    </div>
  );
}
