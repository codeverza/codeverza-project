import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const SALARY_RECORDS_COLLECTION = 'salaryRecords';
const EMPLOYEES_COLLECTION = 'employees';

// GET - Fetch salary records
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const recordId = searchParams.get('id');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (recordId) {
      // Fetch single salary record
      const recordDoc = await getDoc(doc(db, SALARY_RECORDS_COLLECTION, recordId));
      
      if (!recordDoc.exists()) {
        return NextResponse.json(
          { success: false, message: 'Salary record not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        record: { id: recordDoc.id, ...recordDoc.data() }
      });
    }

    // Build query
    let salaryQuery;
    
    if (employeeId) {
      salaryQuery = query(
        collection(db, SALARY_RECORDS_COLLECTION),
        where('employeeId', '==', employeeId),
        orderBy('createdAt', 'desc')
      );
    } else {
      salaryQuery = query(collection(db, SALARY_RECORDS_COLLECTION), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(salaryQuery);
    let records = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter by month and year if provided
    if (month && year) {
      records = records.filter(record => 
        record.month === month && record.year === parseInt(year)
      );
    }

    return NextResponse.json({
      success: true,
      records,
      count: records.length
    });

  } catch (error) {
    console.error('Error fetching salary records:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch salary records', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create salary record with commission calculation
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.employeeId || !data.month || !data.year) {
      return NextResponse.json(
        { success: false, message: 'Employee ID, month, and year are required' },
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

    // Calculate salary components
    const baseSalary = data.baseSalary || employee.monthlySalary || 0;
    
    // Commission calculation
    let commission = 0;
    if (employee.salaryType === 'Commission' || employee.salaryType === 'Salary+Commission') {
      const projectAmount = data.projectAmount || 0;
      const thirdPartyExpenses = data.thirdPartyExpenses || 0;
      
      // Calculate commission on actual project amount (excluding third-party expenses if enabled)
      const calculableAmount = employee.excludeThirdPartyExpenses 
        ? projectAmount - thirdPartyExpenses 
        : projectAmount;
      
      commission = (calculableAmount * (employee.commissionPercentage || 0)) / 100;
    }

    const bonus = data.bonus || 0;
    const incentives = data.incentives || 0;
    const deductions = data.deductions || 0;
    const penalties = data.penalties || 0;

    const grossSalary = baseSalary + commission + bonus + incentives;
    const totalDeductions = deductions + penalties;
    const netSalary = grossSalary - totalDeductions;

    // Prepare salary record
    const salaryRecord = {
      employeeId: data.employeeId,
      employeeName: employee.name,
      employeeIdNumber: employee.employeeId,
      month: data.month,
      year: data.year,
      
      // Salary components
      baseSalary,
      commission,
      projectAmount: data.projectAmount || 0,
      thirdPartyExpenses: data.thirdPartyExpenses || 0,
      commissionPercentage: employee.commissionPercentage || 0,
      bonus,
      incentives,
      deductions,
      penalties,
      
      // Totals
      grossSalary,
      totalDeductions,
      netSalary,
      
      // Payment details
      paymentStatus: data.paymentStatus || 'Pending', // Pending, Paid, Partially Paid
      paymentDate: data.paymentDate || null,
      paymentMethod: data.paymentMethod || '',
      remarks: data.remarks || '',
      
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, SALARY_RECORDS_COLLECTION), salaryRecord);

    return NextResponse.json({
      success: true,
      message: 'Salary record created successfully',
      recordId: docRef.id,
      salaryRecord
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating salary record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create salary record', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update salary record
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

    const recordRef = doc(db, SALARY_RECORDS_COLLECTION, id);
    const recordDoc = await getDoc(recordRef);

    if (!recordDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Salary record not found' },
        { status: 404 }
      );
    }

    // Recalculate if amounts changed
    const currentRecord = recordDoc.data();
    let updatedRecord = { ...updateData };

    if (updateData.baseSalary !== undefined || 
        updateData.commission !== undefined || 
        updateData.bonus !== undefined || 
        updateData.incentives !== undefined || 
        updateData.deductions !== undefined || 
        updateData.penalties !== undefined) {
      
      const baseSalary = updateData.baseSalary ?? currentRecord.baseSalary;
      const commission = updateData.commission ?? currentRecord.commission;
      const bonus = updateData.bonus ?? currentRecord.bonus;
      const incentives = updateData.incentives ?? currentRecord.incentives;
      const deductions = updateData.deductions ?? currentRecord.deductions;
      const penalties = updateData.penalties ?? currentRecord.penalties;

      const grossSalary = baseSalary + commission + bonus + incentives;
      const totalDeductions = deductions + penalties;
      const netSalary = grossSalary - totalDeductions;

      updatedRecord = {
        ...updatedRecord,
        grossSalary,
        totalDeductions,
        netSalary
      };
    }

    await updateDoc(recordRef, {
      ...updatedRecord,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Salary record updated successfully'
    });

  } catch (error) {
    console.error('Error updating salary record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update salary record', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete salary record
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

    const recordRef = doc(db, SALARY_RECORDS_COLLECTION, id);
    const recordDoc = await getDoc(recordRef);

    if (!recordDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Salary record not found' },
        { status: 404 }
      );
    }

    await deleteDoc(recordRef);

    return NextResponse.json({
      success: true,
      message: 'Salary record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting salary record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete salary record', error: error.message },
      { status: 500 }
    );
  }
}
