import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const LEADS_COLLECTION = 'salesLeads';
const EMPLOYEES_COLLECTION = 'employees';

// GET - Fetch leads
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    if (leadId) {
      // Fetch single lead
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
    let leadsQuery;
    
    if (employeeId) {
      leadsQuery = query(
        collection(db, LEADS_COLLECTION),
        where('assignedTo', '==', employeeId),
        orderBy('createdAt', 'desc')
      );
    } else {
      leadsQuery = query(collection(db, LEADS_COLLECTION), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(leadsQuery);
    let leads = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply status filter
    if (status) {
      leads = leads.filter(lead => lead.status === status);
    }

    return NextResponse.json({
      success: true,
      leads,
      count: leads.length
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch leads', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create lead
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.clientName || !data.assignedTo) {
      return NextResponse.json(
        { success: false, message: 'Client name and assigned employee are required' },
        { status: 400 }
      );
    }

    // Verify employee exists and is a sales employee
    const employeeDoc = await getDoc(doc(db, EMPLOYEES_COLLECTION, data.assignedTo));
    if (!employeeDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Assigned employee not found' },
        { status: 404 }
      );
    }

    const employee = employeeDoc.data();

    // Prepare lead data
    const leadData = {
      clientName: data.clientName,
      clientEmail: data.clientEmail || '',
      clientPhone: data.clientPhone || '',
      clientCompany: data.clientCompany || '',
      serviceRequired: data.serviceRequired || '',
      estimatedValue: data.estimatedValue || 0,
      assignedTo: data.assignedTo,
      assignedToName: employee.name,
      assignedToEmployeeId: employee.employeeId,
      status: data.status || 'New', // New, Contacted, Interested, Converted, Lost
      source: data.source || '', // Website, Referral, Social Media, Cold Call, etc.
      priority: data.priority || 'Medium', // Low, Medium, High
      notes: data.notes || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, LEADS_COLLECTION), leadData);

    return NextResponse.json({
      success: true,
      message: 'Lead created successfully',
      leadId: docRef.id,
      lead: leadData
    }, { status: 201 });

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

    // If reassigning lead, update employee details
    if (updateData.assignedTo) {
      const employeeDoc = await getDoc(doc(db, EMPLOYEES_COLLECTION, updateData.assignedTo));
      if (employeeDoc.exists()) {
        const employee = employeeDoc.data();
        updateData.assignedToName = employee.name;
        updateData.assignedToEmployeeId = employee.employeeId;
      }
    }

    await updateDoc(leadRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully'
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

    const leadRef = doc(db, LEADS_COLLECTION, id);
    const leadDoc = await getDoc(leadRef);

    if (!leadDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      );
    }

    await deleteDoc(leadRef);

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete lead', error: error.message },
      { status: 500 }
    );
  }
}
