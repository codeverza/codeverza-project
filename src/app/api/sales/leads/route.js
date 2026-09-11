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
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { NextResponse } from 'next/server';

const LEADS_COLLECTION = 'salesLeads';

// GET - Fetch leads (all or by employeeId)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const leadId = searchParams.get('id');
    const status = searchParams.get('status');

    const leadsRef = collection(db, LEADS_COLLECTION);

    // Get single lead
    if (leadId) {
      const leadDoc = await getDoc(doc(db, LEADS_COLLECTION, leadId));
      if (!leadDoc.exists()) {
        return NextResponse.json(
          { success: false, message: 'Lead not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        lead: { id: leadDoc.id, ...leadDoc.data() }
      });
    }

    // Build query
    let q = query(leadsRef, orderBy('createdAt', 'desc'));
    
    if (employeeId) {
      q = query(leadsRef, where('assignedTo', '==', employeeId), orderBy('createdAt', 'desc'));
    }
    
    if (status) {
      q = query(leadsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const leads = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      leads
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch leads', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new lead
export async function POST(request) {
  try {
    const data = await request.json();

    const {
      clientName,
      clientEmail,
      clientPhone,
      companyName,
      serviceType,
      expectedValue,
      status = 'New',
      priority = 'Medium',
      source = 'Direct',
      assignedTo,
      nextFollowUp,
      notes
    } = data;

    // Validation
    if (!clientName || !serviceType || !assignedTo) {
      return NextResponse.json(
        { success: false, message: 'Client Name, Service Type, and Assigned To are required' },
        { status: 400 }
      );
    }

    const leadData = {
      clientName,
      clientEmail: clientEmail || '',
      clientPhone: clientPhone || '',
      companyName: companyName || '',
      serviceType,
      expectedValue: parseFloat(expectedValue) || 0,
      status,
      priority,
      source,
      assignedTo,
      nextFollowUp: nextFollowUp || null,
      notes: notes || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      wonAt: null,
      actualValue: 0
    };

    const docRef = await addDoc(collection(db, LEADS_COLLECTION), leadData);

    return NextResponse.json({
      success: true,
      message: 'Lead created successfully!',
      leadId: docRef.id,
      lead: { id: docRef.id, ...leadData }
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create lead', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update lead
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const leadRef = doc(db, LEADS_COLLECTION, id);
    const leadDoc = await getDoc(leadRef);

    if (!leadDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      );
    }

    // Add timestamp fields
    updateData.updatedAt = Timestamp.now();
    
    // If status changed to Won, set wonAt timestamp and actualValue
    if (updateData.status === 'Won' && leadDoc.data().status !== 'Won') {
      updateData.wonAt = Timestamp.now();
      if (!updateData.actualValue) {
        updateData.actualValue = leadDoc.data().expectedValue;
      }
    }

    await updateDoc(leadRef, updateData);

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully!'
    });

  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update lead', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete lead
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Lead ID is required' },
        { status: 400 }
      );
    }

    await deleteDoc(doc(db, LEADS_COLLECTION, id));

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully!'
    });

  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete lead', error: error.message },
      { status: 500 }
    );
  }
}
