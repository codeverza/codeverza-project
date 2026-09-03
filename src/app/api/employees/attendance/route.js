import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const ATTENDANCE_COLLECTION = 'attendance';
const EMPLOYEES_COLLECTION = 'employees';

// GET - Fetch attendance records
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const recordId = searchParams.get('id');
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const status = searchParams.get('status');

    if (recordId) {
      // Fetch single attendance record
      const recordDoc = await getDoc(doc(db, ATTENDANCE_COLLECTION, recordId));
      
      if (!recordDoc.exists()) {
        return NextResponse.json(
          { success: false, message: 'Attendance record not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        record: { id: recordDoc.id, ...recordDoc.data() }
      });
    }

    // Build query
    let attendanceQuery;
    
    if (employeeId) {
      attendanceQuery = query(
        collection(db, ATTENDANCE_COLLECTION),
        where('employeeId', '==', employeeId),
        orderBy('date', 'desc')
      );
    } else {
      attendanceQuery = query(collection(db, ATTENDANCE_COLLECTION), orderBy('date', 'desc'));
    }

    const querySnapshot = await getDocs(attendanceQuery);
    let records = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply filters
    if (date) {
      records = records.filter(record => record.date === date);
    }
    if (month && year) {
      records = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() + 1 === parseInt(month) && recordDate.getFullYear() === parseInt(year);
      });
    }
    if (status) {
      records = records.filter(record => record.status === status);
    }

    return NextResponse.json({
      success: true,
      records,
      count: records.length
    });

  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch attendance records', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create attendance record (Check-in/Check-out)
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.employeeId || !data.date) {
      return NextResponse.json(
        { success: false, message: 'Employee ID and date are required' },
        { status: 400 }
      );
    }

    // Fetch employee details
    const employeeDoc = await getDoc(doc(db, EMPLOYEES_COLLECTION, data.employeeId));
    
    if (!employeeDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    const employee = employeeDoc.data();

    // Check if attendance already exists for this date
    const existingQuery = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('employeeId', '==', data.employeeId),
      where('date', '==', data.date)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { success: false, message: 'Attendance already marked for this date' },
        { status: 400 }
      );
    }

    // Prepare attendance record
    const attendanceRecord = {
      employeeId: data.employeeId,
      employeeName: employee.name,
      employeeIdNumber: employee.employeeId,
      date: data.date,
      checkIn: data.checkIn || null,
      checkOut: data.checkOut || null,
      status: data.status || 'Present', // Present, Absent, Late, Half-day, Remote
      workingHours: data.workingHours || 0,
      location: data.location || 'Office', // Office, Remote, On-site
      remarks: data.remarks || '',
      markedBy: data.markedBy || 'System',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Calculate working hours if both check-in and check-out are provided
    if (attendanceRecord.checkIn && attendanceRecord.checkOut) {
      const checkInTime = new Date(`${data.date}T${attendanceRecord.checkIn}`);
      const checkOutTime = new Date(`${data.date}T${attendanceRecord.checkOut}`);
      const diffInMs = checkOutTime - checkInTime;
      attendanceRecord.workingHours = Math.round((diffInMs / (1000 * 60 * 60)) * 100) / 100; // Hours with 2 decimal places
    }

    const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), attendanceRecord);

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      recordId: docRef.id,
      attendanceRecord
    }, { status: 201 });

  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to mark attendance', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update attendance record (for checkout or corrections)
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Record ID is required' },
        { status: 400 }
      );
    }

    const recordRef = doc(db, ATTENDANCE_COLLECTION, id);
    const recordDoc = await getDoc(recordRef);

    if (!recordDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Attendance record not found' },
        { status: 404 }
      );
    }

    const currentRecord = recordDoc.data();

    // Recalculate working hours if check times are updated
    if ((updateData.checkIn || updateData.checkOut) && currentRecord.date) {
      const checkIn = updateData.checkIn || currentRecord.checkIn;
      const checkOut = updateData.checkOut || currentRecord.checkOut;
      
      if (checkIn && checkOut) {
        const checkInTime = new Date(`${currentRecord.date}T${checkIn}`);
        const checkOutTime = new Date(`${currentRecord.date}T${checkOut}`);
        const diffInMs = checkOutTime - checkInTime;
        updateData.workingHours = Math.round((diffInMs / (1000 * 60 * 60)) * 100) / 100;
      }
    }

    await updateDoc(recordRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance record updated successfully'
    });

  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update attendance', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete attendance record
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Record ID is required' },
        { status: 400 }
      );
    }

    const recordRef = doc(db, ATTENDANCE_COLLECTION, id);
    const recordDoc = await getDoc(recordRef);

    if (!recordDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Attendance record not found' },
        { status: 404 }
      );
    }

    await deleteDoc(recordRef);

    return NextResponse.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting attendance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete attendance', error: error.message },
      { status: 500 }
    );
  }
}
