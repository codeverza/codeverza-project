import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const EMPLOYEES_COLLECTION = 'employees';
const PERMISSIONS_COLLECTION = 'employeePermissions';

// POST - Employee Login
export async function POST(request) {
  try {
    const { employeeId, password } = await request.json();

    // Validate input
    if (!employeeId || !password) {
      return NextResponse.json(
        { success: false, message: 'Employee ID aur Password dono required hain' },
        { status: 400 }
      );
    }

    // Find employee by employeeId (like EMP2024001)
    const employeesRef = collection(db, EMPLOYEES_COLLECTION);
    const q = query(employeesRef, where('employeeId', '==', employeeId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, message: 'Employee ID ya Password galat hai' },
        { status: 401 }
      );
    }

    const employeeDoc = querySnapshot.docs[0];
    const employeeData = employeeDoc.data();

    // Check if employee has login enabled
    if (!employeeData.loginEnabled) {
      return NextResponse.json(
        { success: false, message: 'Aapka account abhi active nahi hai. Admin se contact karein.' },
        { status: 403 }
      );
    }

    // Check account status
    if (employeeData.status !== 'Active') {
      return NextResponse.json(
        { success: false, message: `Aapka account ${employeeData.status} hai. Admin se contact karein.` },
        { status: 403 }
      );
    }

    // Verify password
    if (employeeData.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Employee ID ya Password galat hai' },
        { status: 401 }
      );
    }

    // Fetch employee permissions from employee document itself
    let permissions = employeeData.permissions || null;
    
    // If no permissions in employee doc, use defaults
    if (!permissions) {
      permissions = {
        profile: { view: true },
        attendance: { view: true },
        leaves: { view: true, add: true },
        salary: { view: true },
        projects: { view: true },
        tasks: { view: true, add: true, edit: true },
        sales: { view: true, add: true, edit: true }
      };
    }

    // Prepare response data (exclude sensitive info)
    const employeeInfo = {
      id: employeeDoc.id,
      employeeId: employeeData.employeeId,
      name: employeeData.name,
      photo: employeeData.photo,
      email: employeeData.companyEmail || employeeData.personalEmail,
      designation: employeeData.designation,
      department: employeeData.department,
      role: employeeData.role,
      permissions: permissions
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      employee: employeeInfo
    });

  } catch (error) {
    console.error('Employee login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed. Please try again.', error: error.message },
      { status: 500 }
    );
  }
}
