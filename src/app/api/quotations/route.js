import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
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
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

const COLLECTION_NAME = 'quotations';

// Generate quotation number
// Client:   QT-SSDDMMYY   (e.g. QT-0108092026)
// Employee: QT-EMP-SSDDMMYY (e.g. QT-EMP-0108092026)
// Each type has its own independent serial counter — they never mix.
async function generateQuotationNumber(isEmployee = false) {
  const quotationsRef = collection(db, COLLECTION_NAME);
  const q = query(quotationsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  let maxSerial = 0;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const num = data.quotationNumber || '';

    if (isEmployee) {
      // Match employee format: QT-EMP-SSDDMMYY
      const match = num.match(/^QT-EMP-(\d{2})\d{6}$/);
      if (match) {
        const serial = parseInt(match[1], 10);
        if (serial > maxSerial) maxSerial = serial;
      }
    } else {
      // Match client format: QT-SSDDMMYY (must NOT have EMP)
      const match = num.match(/^QT-(\d{2})\d{6}$/);
      if (match) {
        const serial = parseInt(match[1], 10);
        if (serial > maxSerial) maxSerial = serial;
      }
    }
  });

  const nextSerial = String(maxSerial + 1).padStart(2, '0');

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);

  return isEmployee
    ? `QT-EMP-${nextSerial}${dd}${mm}${yy}`
    : `QT-${nextSerial}${dd}${mm}${yy}`;
}

// GET - Fetch all quotations or a single quotation by ID
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Fetch single quotation
    if (id) {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return NextResponse.json({
          success: true,
          data: { id: docSnap.id, ...docSnap.data() }
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Quotation not found'
        }, { status: 404 });
      }
    }

    // Fetch all quotations
    const quotationsRef = collection(db, COLLECTION_NAME);
    const q = query(quotationsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const quotations = [];
    querySnapshot.forEach((doc) => {
      quotations.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({
      success: true,
      data: quotations
    });

  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch quotations',
      error: error.message
    }, { status: 500 });
  }
}

// POST - Create new quotation
export async function POST(request) {
  try {
    const data = await request.json();
    
    console.log('Received quotation data:', data);

    // Validation
    if (!data.clientName || !data.clientEmail) {
      return NextResponse.json({
        success: false,
        message: 'Client name and email are required'
      }, { status: 400 });
    }

    if (!data.services || data.services.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'At least one service is required'
      }, { status: 400 });
    }

    // Generate quotation number — separate counter for client vs employee
    const quotationNumber = await generateQuotationNumber(data.isEmployeeQuotation === true);

    // Calculate totals
    const totalsByCurrency = data.services.reduce((totals, service) => {
      const currency = service.currency || data.currency || 'PKR';
      const amount = parseFloat(service.quantity) * parseFloat(service.price);
      totals[currency] = (totals[currency] || 0) + amount;
      return totals;
    }, {});
    const subtotal = Object.values(totalsByCurrency).reduce((sum, amount) => sum + amount, 0);
    const discountAmount = (subtotal * (parseFloat(data.discount) || 0)) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * (parseFloat(data.tax) || 0)) / 100;
    const grandTotal = taxableAmount + taxAmount;

    const quotationData = {
      quotationNumber,
      
      // Type flag
      isEmployeeQuotation: data.isEmployeeQuotation || false,

      // Client Details
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone || '',
      clientCompany: data.clientCompany || '',
      clientAddress: data.clientAddress || '',

      // Company contact (used in header/footer of employee quotations)
      companyEmail: data.companyEmail || 'info@codeverza.com',
      companyPhone: data.companyPhone || '+92 325 1507557',
      companyWebsite: data.companyWebsite || 'www.codeverza.com',
      
      // Services
      services: data.services,
      totalsByCurrency,
      
      // Pricing
      subtotal,
      discount: data.discount || 0,
      discountAmount,
      tax: data.tax || 0,
      taxAmount,
      grandTotal,
      currency: data.currency || 'PKR',
      
      // Dates
      issueDate: data.issueDate,
      validityDate: data.validityDate,
      
      // Additional Info
      paymentTerms: data.paymentTerms || '',
      projectTimeline: data.projectTimeline || '',
      notes: data.notes || '',
      termsAndConditions: data.termsAndConditions || '',
      
      // Status
      status: data.status || 'Draft',
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('Saving quotation data:', quotationData);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), quotationData);

    console.log('Quotation created with ID:', docRef.id);

    return NextResponse.json({
      success: true,
      message: 'Quotation created successfully',
      data: {
        id: docRef.id,
        ...quotationData
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating quotation:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({
      success: false,
      message: `Failed to create quotation: ${error.message}`,
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}

// PUT - Update quotation
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Quotation ID is required'
      }, { status: 400 });
    }

    // Recalculate totals if services or pricing changed
    if (updateData.services || updateData.discount !== undefined || updateData.tax !== undefined) {
      const services = updateData.services || data.services;
      const totalsByCurrency = services.reduce((totals, service) => {
        const currency = service.currency || updateData.currency || data.currency || 'PKR';
        totals[currency] = (totals[currency] || 0) + (service.quantity * service.price);
        return totals;
      }, {});
      const subtotal = Object.values(totalsByCurrency).reduce((sum, amount) => sum + amount, 0);

      const discountAmount = (subtotal * (updateData.discount ?? data.discount ?? 0)) / 100;
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = (taxableAmount * (updateData.tax ?? data.tax ?? 0)) / 100;
      const grandTotal = taxableAmount + taxAmount;

      updateData.subtotal = subtotal;
      updateData.discountAmount = discountAmount;
      updateData.taxAmount = taxAmount;
      updateData.grandTotal = grandTotal;
      updateData.totalsByCurrency = totalsByCurrency;
    }

    updateData.updatedAt = serverTimestamp();

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updateData);

    return NextResponse.json({
      success: true,
      message: 'Quotation updated successfully',
      data: { id, ...updateData }
    });

  } catch (error) {
    console.error('Error updating quotation:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update quotation',
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete quotation
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Quotation ID is required'
      }, { status: 400 });
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);

    return NextResponse.json({
      success: true,
      message: 'Quotation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete quotation',
      error: error.message
    }, { status: 500 });
  }
}
