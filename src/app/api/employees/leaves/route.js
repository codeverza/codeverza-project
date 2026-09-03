import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const LEAVES_COLLECTION = 'leaves';
const EMPLOYEES_COLLECTION = 'employees';

// GET - Fetch leave requests
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const leaveId = searchParams.get('id');
    const status = searchParams.get('status');
    const leaveType = searchParams.get('leaveType');

    if (leaveId) {
      // Fetch single leave request
      const leaveDoc = await getDoc(doc(db, LEAVES_COLLECTION, leaveId));
      
      if (!leaveDoc.exists()) {
        return NextResponse.json(
          { success: false, message: 'Leave request not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        leave: { id: leaveDoc.id, ...leaveDoc.data() }
      });
    }

    // Build query
    let leavesQuery;
    
    if (employeeId) {
      leavesQuery = query(
        collection(db, LEAVES_COLLECTION),
        where('employeeId', '==', employeeId),
        orderBy('createdAt', 'desc')
      );
    } else {
      leavesQuery = query(collection(db, LEAVES_COLLECTION), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(leavesQuery);
    let leaves = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply filters
    if (status) {
      leaves = leaves.filter(leave => leave.status === status);
    }
    if (leaveType) {
      leaves = leaves.filter(leave => leave.leaveType === leaveType);
    }

    return NextResponse.json({
      success: true,
      leaves,
      count: leaves.length
    });

  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch leave requests', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create leave request
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.employeeId || !data.leaveType || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { success: false, message: 'Employee ID, leave type, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Fetch employee details
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, data.employeeId);
    const employeeDoc = await getDoc(employeeRef);
    
    if (!employeeDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    const employee = employeeDoc.data();

    // Calculate number of days
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end date

    // Check leave balance
    let leaveBalance = 0;
    let leaveField = '';
    
    switch (data.leaveType) {
      case 'Casual':
        leaveBalance = employee.casualLeaves || 0;
        leaveField = 'casualLeaves';
        break;
      case 'Sick':
        leaveBalance = employee.sickLeaves || 0;
        leaveField = 'sickLeaves';
        break;
      case 'Annual':
        leaveBalance = employee.annualLeaves || 0;
        leaveField = 'annualLeaves';
        break;
      default:
        leaveBalance = 0;
    }

    // Prepare leave request
    const leaveRequest = {
      employeeId: data.employeeId,
      employeeName: employee.name,
      employeeIdNumber: employee.employeeId,
      leaveType: data.leaveType, // Casual, Sick, Annual
      startDate: data.startDate,
      endDate: data.endDate,
      numberOfDays: diffDays,
      reason: data.reason || '',
      status: 'Pending', // Pending, Approved, Rejected
      appliedDate: new Date().toISOString().split('T')[0],
      approvedBy: null,
      approvalDate: null,
      rejectionReason: '',
      availableBalance: leaveBalance,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, LEAVES_COLLECTION), leaveRequest);

    return NextResponse.json({
      success: true,
      message: 'Leave request submitted successfully',
      leaveId: docRef.id,
      leaveRequest
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create leave request', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update leave request (Approve/Reject)
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Leave ID is required' },
        { status: 400 }
      );
    }

    const leaveRef = doc(db, LEAVES_COLLECTION, id);
    const leaveDoc = await getDoc(leaveRef);

    if (!leaveDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Leave request not found' },
        { status: 404 }
      );
    }

    const currentLeave = leaveDoc.data();

    // If approving leave, deduct from employee's leave balance
    if (updateData.status === 'Approved' && currentLeave.status === 'Pending') {
      const employeeRef = doc(db, EMPLOYEES_COLLECTION, currentLeave.employeeId);
      const employeeDoc = await getDoc(employeeRef);
      
      if (employeeDoc.exists()) {
        const employee = employeeDoc.data();
        let leaveField = '';
        let currentBalance = 0;

        switch (currentLeave.leaveType) {
          case 'Casual':
            leaveField = 'casualLeaves';
            currentBalance = employee.casualLeaves || 0;
            break;
          case 'Sick':
            leaveField = 'sickLeaves';
            currentBalance = employee.sickLeaves || 0;
            break;
          case 'Annual':
            leaveField = 'annualLeaves';
            currentBalance = employee.annualLeaves || 0;
            break;
        }

        if (leaveField && currentBalance >= currentLeave.numberOfDays) {
          // Deduct leaves
          await updateDoc(employeeRef, {
            [leaveField]: currentBalance - currentLeave.numberOfDays,
            updatedAt: Timestamp.now()
          });
        } else if (leaveField) {
          return NextResponse.json(
            { success: false, message: 'Insufficient leave balance' },
            { status: 400 }
          );
        }
      }

      updateData.approvalDate = new Date().toISOString().split('T')[0];
    }

    await updateDoc(leaveRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Leave request updated successfully'
    });

  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update leave request', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete leave request
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Leave ID is required' },
        { status: 400 }
      );
    }

    const leaveRef = doc(db, LEAVES_COLLECTION, id);
    const leaveDoc = await getDoc(leaveRef);

    if (!leaveDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Leave request not found' },
        { status: 404 }
      );
    }

    const leave = leaveDoc.data();

    // If leave was approved, restore the balance
    if (leave.status === 'Approved') {
      const employeeRef = doc(db, EMPLOYEES_COLLECTION, leave.employeeId);
      const employeeDoc = await getDoc(employeeRef);
      
      if (employeeDoc.exists()) {
        const employee = employeeDoc.data();
        let leaveField = '';
        let currentBalance = 0;

        switch (leave.leaveType) {
          case 'Casual':
            leaveField = 'casualLeaves';
            currentBalance = employee.casualLeaves || 0;
            break;
          case 'Sick':
            leaveField = 'sickLeaves';
            currentBalance = employee.sickLeaves || 0;
            break;
          case 'Annual':
            leaveField = 'annualLeaves';
            currentBalance = employee.annualLeaves || 0;
            break;
        }

        if (leaveField) {
          await updateDoc(employeeRef, {
            [leaveField]: currentBalance + leave.numberOfDays,
            updatedAt: Timestamp.now()
          });
        }
      }
    }

    await deleteDoc(leaveRef);

    return NextResponse.json({
      success: true,
      message: 'Leave request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting leave request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete leave request', error: error.message },
      { status: 500 }
    );
  }
}
