import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, getDoc, query, where, orderBy, Timestamp, limit } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const LOGIN_HISTORY_COLLECTION = 'employeeLoginHistory';
const EMPLOYEES_COLLECTION = 'employees';

// GET - Fetch login history
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const recordLimit = searchParams.get('limit') || 50;

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Fetch login history for employee
    const historyQuery = query(
      collection(db, LOGIN_HISTORY_COLLECTION),
      where('employeeId', '==', employeeId),
      orderBy('loginTime', 'desc'),
      limit(parseInt(recordLimit))
    );

    const querySnapshot = await getDocs(historyQuery);
    const history = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      history,
      count: history.length
    });

  } catch (error) {
    console.error('Error fetching login history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch login history', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Record login
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.employeeId) {
      return NextResponse.json(
        { success: false, message: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Verify employee exists
    const employeeDoc = await getDoc(doc(db, EMPLOYEES_COLLECTION, data.employeeId));
    if (!employeeDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    const employee = employeeDoc.data();

    // Prepare login history data
    const loginData = {
      employeeId: data.employeeId,
      employeeName: employee.name,
      employeeIdNumber: employee.employeeId,
      loginTime: Timestamp.now(),
      ipAddress: data.ipAddress || '',
      deviceType: data.deviceType || 'Unknown', // Desktop, Mobile, Tablet
      browser: data.browser || 'Unknown',
      location: data.location || 'Unknown',
      status: data.status || 'Success', // Success, Failed
      logoutTime: null,
      sessionDuration: null
    };

    const docRef = await addDoc(collection(db, LOGIN_HISTORY_COLLECTION), loginData);

    return NextResponse.json({
      success: true,
      message: 'Login recorded successfully',
      sessionId: docRef.id,
      loginData
    }, { status: 201 });

  } catch (error) {
    console.error('Error recording login:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record login', error: error.message },
      { status: 500 }
    );
  }
}
