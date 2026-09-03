import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const FOLLOWUPS_COLLECTION = 'salesFollowups';
const LEADS_COLLECTION = 'salesLeads';
const EMPLOYEES_COLLECTION = 'employees';

// GET - Fetch follow-ups
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const followupId = searchParams.get('id');
    const leadId = searchParams.get('leadId');
    const employeeId = searchParams.get('employeeId');

    if (followupId) {
      // Fetch single follow-up
      const followupDoc = await getDoc(doc(db, FOLLOWUPS_COLLECTION, followupId));
      
      if (!followupDoc.exists()) {
        return NextResponse.json(
          { success: false, message: 'Follow-up not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        followup: { id: followupDoc.id, ...followupDoc.data() }
      });
    }

    // Build query
    let followupsQuery;
    
    if (leadId) {
      followupsQuery = query(
        collection(db, FOLLOWUPS_COLLECTION),
        where('leadId', '==', leadId),
        orderBy('followupDate', 'desc')
      );
    } else if (employeeId) {
      followupsQuery = query(
        collection(db, FOLLOWUPS_COLLECTION),
        where('employeeId', '==', employeeId),
        orderBy('followupDate', 'desc')
      );
    } else {
      followupsQuery = query(collection(db, FOLLOWUPS_COLLECTION), orderBy('followupDate', 'desc'));
    }

    const querySnapshot = await getDocs(followupsQuery);
    const followups = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      followups,
      count: followups.length
    });

  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch follow-ups', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create follow-up record
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.leadId || !data.employeeId || !data.followupDate) {
      return NextResponse.json(
        { success: false, message: 'Lead ID, employee ID, and follow-up date are required' },
        { status: 400 }
      );
    }

    // Verify lead exists
    const leadDoc = await getDoc(doc(db, LEADS_COLLECTION, data.leadId));
    if (!leadDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      );
    }

    const lead = leadDoc.data();

    // Verify employee exists
    const employeeDoc = await getDoc(doc(db, EMPLOYEES_COLLECTION, data.employeeId));
    if (!employeeDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    const employee = employeeDoc.data();

    // Prepare follow-up data
    const followupData = {
      leadId: data.leadId,
      clientName: lead.clientName,
      employeeId: data.employeeId,
      employeeName: employee.name,
      employeeIdNumber: employee.employeeId,
      followupDate: data.followupDate,
      followupTime: data.followupTime || '',
      contactMethod: data.contactMethod || 'Phone', // Phone, Email, Meeting, WhatsApp, etc.
      outcome: data.outcome || '', // Interested, Not Interested, Call Back Later, Meeting Scheduled, etc.
      notes: data.notes || '',
      nextFollowupDate: data.nextFollowupDate || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, FOLLOWUPS_COLLECTION), followupData);

    return NextResponse.json({
      success: true,
      message: 'Follow-up recorded successfully',
      followupId: docRef.id,
      followup: followupData
    }, { status: 201 });

  } catch (error) {
    console.error('Error recording follow-up:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record follow-up', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update follow-up
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Follow-up ID is required' },
        { status: 400 }
      );
    }

    const followupRef = doc(db, FOLLOWUPS_COLLECTION, id);
    const followupDoc = await getDoc(followupRef);

    if (!followupDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Follow-up not found' },
        { status: 404 }
      );
    }

    await updateDoc(followupRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Follow-up updated successfully'
    });

  } catch (error) {
    console.error('Error updating follow-up:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update follow-up', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete follow-up
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Follow-up ID is required' },
        { status: 400 }
      );
    }

    const followupRef = doc(db, FOLLOWUPS_COLLECTION, id);
    const followupDoc = await getDoc(followupRef);

    if (!followupDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Follow-up not found' },
        { status: 404 }
      );
    }

    await deleteDoc(followupRef);

    return NextResponse.json({
      success: true,
      message: 'Follow-up deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting follow-up:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete follow-up', error: error.message },
      { status: 500 }
    );
  }
}
