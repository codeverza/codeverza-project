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

const FOLLOWUPS_COLLECTION = 'salesFollowups';

// GET - Fetch follow-ups (all or by employeeId/leadId)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const leadId = searchParams.get('leadId');
    const followupId = searchParams.get('id');
    const status = searchParams.get('status'); // pending, completed

    const followupsRef = collection(db, FOLLOWUPS_COLLECTION);

    // Get single follow-up
    if (followupId) {
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
    let q = query(followupsRef, orderBy('scheduledDate', 'asc'));
    
    if (employeeId) {
      q = query(followupsRef, where('employeeId', '==', employeeId), orderBy('scheduledDate', 'asc'));
    }
    
    if (leadId) {
      q = query(followupsRef, where('leadId', '==', leadId), orderBy('scheduledDate', 'asc'));
    }

    if (status) {
      q = query(followupsRef, where('status', '==', status), orderBy('scheduledDate', 'asc'));
    }

    const querySnapshot = await getDocs(q);
    const followups = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      followups
    });

  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch follow-ups', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new follow-up
export async function POST(request) {
  try {
    const data = await request.json();

    const {
      leadId,
      employeeId,
      scheduledDate,
      scheduledTime,
      type = 'Call', // Call, Email, Meeting, Visit
      notes,
      reminder = true
    } = data;

    // Validation
    if (!leadId || !employeeId || !scheduledDate) {
      return NextResponse.json(
        { success: false, message: 'Lead ID, Employee ID, and Scheduled Date are required' },
        { status: 400 }
      );
    }

    const followupData = {
      leadId,
      employeeId,
      scheduledDate,
      scheduledTime: scheduledTime || '',
      type,
      notes: notes || '',
      reminder,
      status: 'pending',
      completedAt: null,
      completionNotes: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, FOLLOWUPS_COLLECTION), followupData);

    return NextResponse.json({
      success: true,
      message: 'Follow-up scheduled successfully!',
      followupId: docRef.id,
      followup: { id: docRef.id, ...followupData }
    });

  } catch (error) {
    console.error('Error creating follow-up:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create follow-up', error: error.message },
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

    // Add timestamp
    updateData.updatedAt = Timestamp.now();
    
    // If marking as completed, add completedAt timestamp
    if (updateData.status === 'completed' && followupDoc.data().status !== 'completed') {
      updateData.completedAt = Timestamp.now();
    }

    await updateDoc(followupRef, updateData);

    return NextResponse.json({
      success: true,
      message: 'Follow-up updated successfully!'
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

    await deleteDoc(doc(db, FOLLOWUPS_COLLECTION, id));

    return NextResponse.json({
      success: true,
      message: 'Follow-up deleted successfully!'
    });

  } catch (error) {
    console.error('Error deleting follow-up:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete follow-up', error: error.message },
      { status: 500 }
    );
  }
}
