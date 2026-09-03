import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const EMPLOYEES_COLLECTION = 'employees';

// Generate Employee ID
function generateEmployeeId(count) {
  const year = new Date().getFullYear();
  const idNumber = String(count + 1).padStart(4, '0');
  return `EMP${year}${idNumber}`;
}

// GET - Fetch all employees or single employee
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('id');
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const employmentType = searchParams.get('employmentType');

    if (employeeId) {
      // Fetch single employee
      const employeeDoc = await getDoc(doc(db, EMPLOYEES_COLLECTION, employeeId));
      
      if (!employeeDoc.exists()) {
        return NextResponse.json(
          { success: false, message: 'Employee not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        employee: { id: employeeDoc.id, ...employeeDoc.data() }
      });
    }

    // Build query with filters
    let employeesQuery = query(collection(db, EMPLOYEES_COLLECTION), orderBy('createdAt', 'desc'));

    if (status) {
      employeesQuery = query(collection(db, EMPLOYEES_COLLECTION), where('status', '==', status), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(employeesQuery);
    let employees = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply additional filters in memory (if needed)
    if (department) {
      employees = employees.filter(emp => emp.department === department);
    }
    if (employmentType) {
      employees = employees.filter(emp => emp.employmentType === employmentType);
    }

    return NextResponse.json({
      success: true,
      employees,
      count: employees.length
    });

  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch employees', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new employee
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'cnic', 'contactNumber', 'personalEmail', 'designation', 'department', 'joiningDate', 'employmentType'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Get current count to generate employee ID
    const employeesSnapshot = await getDocs(collection(db, EMPLOYEES_COLLECTION));
    const employeeId = generateEmployeeId(employeesSnapshot.size);

    // Prepare employee data
    const employeeData = {
      employeeId,
      name: data.name,
      photo: data.photo || '',
      cnic: data.cnic,
      contactNumber: data.contactNumber,
      personalEmail: data.personalEmail,
      companyEmail: data.companyEmail || '',
      address: data.address || '',
      emergencyContact: data.emergencyContact || '',
      designation: data.designation,
      department: data.department,
      joiningDate: data.joiningDate,
      employmentType: data.employmentType, // Full-time, Part-time, Intern, Remote
      reportingManager: data.reportingManager || '',
      status: 'Active', // Active, Suspended, Resigned, Terminated
      
      // Salary info
      monthlySalary: data.monthlySalary || 0,
      salaryType: data.salaryType || 'Fixed', // Fixed, Commission, Salary+Commission
      commissionPercentage: data.commissionPercentage || 0,
      excludeThirdPartyExpenses: data.excludeThirdPartyExpenses || true,
      
      // Leave balance
      casualLeaves: data.casualLeaves || 12,
      sickLeaves: data.sickLeaves || 10,
      annualLeaves: data.annualLeaves || 15,
      
      // Role and permissions
      role: data.role || 'Employee',
      isSalesEmployee: data.isSalesEmployee || false,
      
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), employeeData);

    return NextResponse.json({
      success: true,
      message: 'Employee created successfully',
      employeeId: docRef.id,
      generatedEmployeeId: employeeId
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create employee', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update employee
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const employeeRef = doc(db, EMPLOYEES_COLLECTION, id);
    const employeeDoc = await getDoc(employeeRef);

    if (!employeeDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    await updateDoc(employeeRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully'
    });

  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update employee', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete employee
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const employeeRef = doc(db, EMPLOYEES_COLLECTION, id);
    const employeeDoc = await getDoc(employeeRef);

    if (!employeeDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    await deleteDoc(employeeRef);

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete employee', error: error.message },
      { status: 500 }
    );
  }
}
