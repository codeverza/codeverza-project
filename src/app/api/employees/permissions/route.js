import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const PERMISSIONS_COLLECTION = 'employeePermissions';
const EMPLOYEES_COLLECTION = 'employees';
const LOGIN_HISTORY_COLLECTION = 'employeeLoginHistory';

// GET - Fetch permissions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const permissionId = searchParams.get('id');

    if (permissionId) {
      // Fetch single permission record
      const permissionDoc = await getDoc(doc(db, PERMISSIONS_COLLECTION, permissionId));
      
      if (!permissionDoc.exists()) {
        return NextResponse.json(
          { success: false, message: 'Permission record not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        permission: { id: permissionDoc.id, ...permissionDoc.data() }
      });
    }

    if (employeeId) {
      // Fetch permissions for specific employee
      const permissionQuery = query(
        collection(db, PERMISSIONS_COLLECTION),
        where('employeeId', '==', employeeId)
      );
      const querySnapshot = await getDocs(permissionQuery);
      
      if (querySnapshot.empty) {
        return NextResponse.json({
          success: true,
          permission: null,
          message: 'No permissions found for this employee'
        });
      }

      const permission = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };

      return NextResponse.json({
        success: true,
        permission
      });
    }

    // Fetch all permissions
    const querySnapshot = await getDocs(collection(db, PERMISSIONS_COLLECTION));
    const permissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      permissions,
      count: permissions.length
    });

  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch permissions', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create permission record
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.employeeId || !data.role) {
      return NextResponse.json(
        { success: false, message: 'Employee ID and role are required' },
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

    // Check if permissions already exist for this employee
    const existingQuery = query(
      collection(db, PERMISSIONS_COLLECTION),
      where('employeeId', '==', data.employeeId)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { success: false, message: 'Permissions already exist for this employee. Use PUT to update.' },
        { status: 400 }
      );
    }

    // Prepare permission data with module-wise permissions
    const permissionData = {
      employeeId: data.employeeId,
      employeeName: employee.name,
      employeeIdNumber: employee.employeeId,
      role: data.role, // Admin, Manager, Employee, Sales, HR, etc.
      
      // Account status
      accountStatus: data.accountStatus || 'Active', // Active, Suspended, Deactivated
      loginEnabled: data.loginEnabled !== undefined ? data.loginEnabled : true,
      
      // Module-wise permissions
      modules: {
        // Dashboard
        dashboard: {
          view: data.modules?.dashboard?.view ?? true
        },
        
        // Employee Management
        employees: {
          view: data.modules?.employees?.view ?? false,
          add: data.modules?.employees?.add ?? false,
          edit: data.modules?.employees?.edit ?? false,
          delete: data.modules?.employees?.delete ?? false
        },
        
        // Attendance
        attendance: {
          view: data.modules?.attendance?.view ?? true,
          add: data.modules?.attendance?.add ?? false,
          edit: data.modules?.attendance?.edit ?? false,
          delete: data.modules?.attendance?.delete ?? false
        },
        
        // Leave Management
        leaves: {
          view: data.modules?.leaves?.view ?? true,
          add: data.modules?.leaves?.add ?? true,
          edit: data.modules?.leaves?.edit ?? false,
          delete: data.modules?.leaves?.delete ?? false,
          approve: data.modules?.leaves?.approve ?? false
        },
        
        // Salary & Commission
        salary: {
          view: data.modules?.salary?.view ?? false,
          add: data.modules?.salary?.add ?? false,
          edit: data.modules?.salary?.edit ?? false,
          delete: data.modules?.salary?.delete ?? false
        },
        
        // Projects & Tasks
        projects: {
          view: data.modules?.projects?.view ?? true,
          add: data.modules?.projects?.add ?? false,
          edit: data.modules?.projects?.edit ?? false,
          delete: data.modules?.projects?.delete ?? false
        },
        
        // Sales (Leads & Follow-ups)
        sales: {
          view: data.modules?.sales?.view ?? false,
          add: data.modules?.sales?.add ?? false,
          edit: data.modules?.sales?.edit ?? false,
          delete: data.modules?.sales?.delete ?? false
        },
        
        // Documents
        documents: {
          view: data.modules?.documents?.view ?? true,
          add: data.modules?.documents?.add ?? false,
          edit: data.modules?.documents?.edit ?? false,
          delete: data.modules?.documents?.delete ?? false
        },
        
        // Reports & Performance
        reports: {
          view: data.modules?.reports?.view ?? false
        }
      },
      
      // Password management
      passwordResetRequired: data.passwordResetRequired || false,
      lastPasswordChange: data.lastPasswordChange || null,
      
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, PERMISSIONS_COLLECTION), permissionData);

    // Update employee record with role
    await updateDoc(doc(db, EMPLOYEES_COLLECTION, data.employeeId), {
      role: data.role,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Permissions created successfully',
      permissionId: docRef.id,
      permission: permissionData
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating permissions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create permissions', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update permissions
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Permission ID is required' },
        { status: 400 }
      );
    }

    const permissionRef = doc(db, PERMISSIONS_COLLECTION, id);
    const permissionDoc = await getDoc(permissionRef);

    if (!permissionDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Permission record not found' },
        { status: 404 }
      );
    }

    await updateDoc(permissionRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });

    // If role is being updated, update employee record too
    if (updateData.role) {
      const currentPermission = permissionDoc.data();
      await updateDoc(doc(db, EMPLOYEES_COLLECTION, currentPermission.employeeId), {
        role: updateData.role,
        updatedAt: Timestamp.now()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Permissions updated successfully'
    });

  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update permissions', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete permissions
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Permission ID is required' },
        { status: 400 }
      );
    }

    const permissionRef = doc(db, PERMISSIONS_COLLECTION, id);
    const permissionDoc = await getDoc(permissionRef);

    if (!permissionDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Permission record not found' },
        { status: 404 }
      );
    }

    await deleteDoc(permissionRef);

    return NextResponse.json({
      success: true,
      message: 'Permissions deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting permissions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete permissions', error: error.message },
      { status: 500 }
    );
  }
}
