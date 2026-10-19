import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';

// Employee-created quotations live in their own top-level collection
// so admin can see all of them in one place for approval.
//
// Each document shape:
// {
//   quotationNumber:  String  (CV-QT-CLI-SSDDMMYYYY — shared global counter)
//   employeeId:       String  (Firestore doc ID of the employee)
//   employeeName:     String
//   employeeEmail:    String  (company email used in header/footer)
//   employeePhone:    String  (contact number used in header/footer)
//   employeeDesignation: String
//   companyWebsite:   'www.codeverza.com'  (always fixed)
//
//   clientName, clientEmail, clientPhone, clientCompany, clientAddress
//   services[], totalsByCurrency, subtotal, discount, discountAmount,
//   tax, taxAmount, grandTotal, currency
//   issueDate, validityDate
//   paymentTerms, projectTimeline, notes, termsAndConditions
//
//   approvalStatus:   'Pending' | 'Approved' | 'Rejected'
//   approvedAt:       Timestamp | null
//   approvedBy:       String ('admin')
//
//   // Signatory — empty until admin approves
//   authorizedSignatureName:  String
//   authorizedSignatureTitle: String
//   companyStampLabel:        String
//
//   status:           'Draft'  (always Draft until admin approves, then can be Sent etc.)
//   createdAt, updatedAt: Timestamp
// }

const COLLECTION_NAME = 'employeeQuotations';
const QUOTATIONS_COLLECTION = 'quotations'; // shared serial counter source

// ── serial number generation ──────────────────────────────────────────────────
// Shared global counter across both quotations and employeeQuotations collections.
async function generateQuotationNumber() {
  // Scan both collections for the highest existing CV-QT-CLI serial
  const regex = /^CV-QT-CLI-(\d{2})\d{8}$/;

  const [adminSnap, empSnap] = await Promise.all([
    getDocs(query(collection(db, QUOTATIONS_COLLECTION), orderBy('createdAt', 'desc'))),
    getDocs(query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))),
  ]);

  let maxSerial = 0;

  const scanSnap = (snap) => {
    snap.forEach((docSnap) => {
      const num = docSnap.data().quotationNumber || '';
      const match = num.match(regex);
      if (match) {
        const serial = parseInt(match[1], 10);
        if (serial > maxSerial) maxSerial = serial;
      }
    });
  };

  scanSnap(adminSnap);
  scanSnap(empSnap);

  const nextSerial = String(maxSerial + 1).padStart(2, '0');
  const now = new Date();
  const dd   = String(now.getDate()).padStart(2, '0');
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = String(now.getFullYear());

  return `CV-QT-CLI-${nextSerial}${dd}${mm}${yyyy}`;
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id         = searchParams.get('id');
    const employeeId = searchParams.get('employeeId');
    const pending    = searchParams.get('pending'); // ?pending=1  → admin approval list

    // Single quotation by Firestore doc ID
    if (id) {
      const docRef  = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return NextResponse.json({ success: false, message: 'Quotation not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: { id: docSnap.id, ...docSnap.data() } });
    }

    // All quotations pending admin approval
    if (pending === '1') {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('approvalStatus', '==', 'Pending'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const quotations = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return NextResponse.json({ success: true, data: quotations });
    }

    // All quotations for a specific employee
    if (employeeId) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('employeeId', '==', employeeId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const quotations = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return NextResponse.json({ success: true, data: quotations });
    }

    // All employee quotations (admin view — all)
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const quotations = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data: quotations });

  } catch (error) {
    console.error('Error fetching employee quotations:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch quotations', error: error.message },
      { status: 500 }
    );
  }
}

// ── POST (employee creates a new quotation) ───────────────────────────────────
export async function POST(request) {
  try {
    const data = await request.json();

    // Basic validation
    if (!data.employeeId) {
      return NextResponse.json({ success: false, message: 'employeeId is required' }, { status: 400 });
    }
    if (!data.clientName || !data.clientEmail) {
      return NextResponse.json({ success: false, message: 'Client name and email are required' }, { status: 400 });
    }
    if (!data.services || data.services.length === 0) {
      return NextResponse.json({ success: false, message: 'At least one service is required' }, { status: 400 });
    }

    const quotationNumber = await generateQuotationNumber();

    // Calculate totals
    const totalsByCurrency = data.services.reduce((totals, service) => {
      const currency = service.currency || data.currency || 'PKR';
      const amount = parseFloat(service.quantity) * parseFloat(service.price);
      totals[currency] = (totals[currency] || 0) + amount;
      return totals;
    }, {});
    const subtotal       = Object.values(totalsByCurrency).reduce((s, a) => s + a, 0);
    const discountAmount = (subtotal * (parseFloat(data.discount) || 0)) / 100;
    const taxableAmount  = subtotal - discountAmount;
    const taxAmount      = (taxableAmount * (parseFloat(data.tax) || 0)) / 100;
    const grandTotal     = taxableAmount + taxAmount;

    const quotationData = {
      quotationNumber,

      // Employee info (shown in header / footer instead of company defaults)
      employeeId:          data.employeeId,
      employeeName:        data.employeeName        || '',
      employeeEmail:       data.employeeEmail       || '',  // business/company email
      employeePhone:       data.employeePhone       || '',
      employeeDesignation: data.employeeDesignation || '',
      companyWebsite:      'www.codeverza.com',             // always fixed

      // Client
      clientName:    data.clientName,
      clientEmail:   data.clientEmail,
      clientPhone:   data.clientPhone   || '',
      clientCompany: data.clientCompany || '',
      clientAddress: data.clientAddress || '',

      // Services & pricing
      services:         data.services,
      totalsByCurrency,
      subtotal,
      discount:        data.discount || 0,
      discountAmount,
      tax:             data.tax || 0,
      taxAmount,
      grandTotal,
      currency:        data.currency || 'PKR',

      // Dates
      issueDate:     data.issueDate    || '',
      validityDate:  data.validityDate || '',

      // Extra info
      paymentTerms:       data.paymentTerms       || '',
      projectTimeline:    data.projectTimeline    || '',
      notes:              data.notes              || '',
      termsAndConditions: data.termsAndConditions || '',

      // Approval workflow — starts as Pending
      approvalStatus: 'Pending',
      approvedAt:     null,
      approvedBy:     '',

      // Signatory — blank until approved by admin
      authorizedSignatureName:  '',
      authorizedSignatureTitle: '',
      companyStampLabel:        '',

      // Quotation status (separate from approval)
      status: 'Draft',

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), quotationData);

    return NextResponse.json(
      { success: true, message: 'Quotation created successfully', data: { id: docRef.id, ...quotationData } },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating employee quotation:', error);
    return NextResponse.json(
      { success: false, message: `Failed to create quotation: ${error.message}`, error: error.message },
      { status: 500 }
    );
  }
}

// ── PUT (admin approves/rejects OR employee edits a pending quotation) ────────
export async function PUT(request) {
  try {
    const data     = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Quotation ID is required' }, { status: 400 });
    }

    // If admin is approving, auto-fill signatory fields
    if (updateData.approvalStatus === 'Approved') {
      updateData.approvedAt = serverTimestamp();
      updateData.approvedBy = 'admin';
      // Auto-fill signatory with the admin/company defaults
      if (!updateData.authorizedSignatureName) {
        updateData.authorizedSignatureName  = 'Muhammad Aqdas';
        updateData.authorizedSignatureTitle = 'CEO';
        updateData.companyStampLabel        = 'CODEVERZA';
      }
    }

    // Recalculate totals if services changed
    if (updateData.services) {
      const services = updateData.services;
      const totalsByCurrency = services.reduce((totals, service) => {
        const currency = service.currency || updateData.currency || 'PKR';
        totals[currency] = (totals[currency] || 0) + (service.quantity * service.price);
        return totals;
      }, {});
      const subtotal       = Object.values(totalsByCurrency).reduce((s, a) => s + a, 0);
      const discountAmount = (subtotal * (updateData.discount ?? 0)) / 100;
      const taxableAmount  = subtotal - discountAmount;
      const taxAmount      = (taxableAmount * (updateData.tax ?? 0)) / 100;
      const grandTotal     = taxableAmount + taxAmount;

      updateData.subtotal          = subtotal;
      updateData.discountAmount    = discountAmount;
      updateData.taxAmount         = taxAmount;
      updateData.grandTotal        = grandTotal;
      updateData.totalsByCurrency  = totalsByCurrency;
    }

    updateData.updatedAt = serverTimestamp();

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updateData);

    return NextResponse.json({ success: true, message: 'Quotation updated successfully', data: { id, ...updateData } });

  } catch (error) {
    console.error('Error updating employee quotation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update quotation', error: error.message },
      { status: 500 }
    );
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Quotation ID is required' }, { status: 400 });
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id));

    return NextResponse.json({ success: true, message: 'Quotation deleted successfully' });

  } catch (error) {
    console.error('Error deleting employee quotation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete quotation', error: error.message },
      { status: 500 }
    );
  }
}
