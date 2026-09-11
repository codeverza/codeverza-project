import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const PERMISSIONS_COLLECTION = 'employeePermissions';

// GET - Fetch permissions for an employee
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const permissionId = searchParams.get('id');

    if (permissionId) {
      // Fetch single permission record by ID
      const permDoc = await getDoc(doc(db, PERMISSIONS_COLLECTION, permissionId));
      
      if (!permDoc.exists()) {
        return NextResponse.json(
          { success: false, message: 'Permission record not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        permission: { id: permDoc.id, ...permDoc.data() }
      });
    }

    if (employeeId) {
      // Fetch permissions for specific employee
      const q = query(collection(db, PERMISSIONS_COLLECTION), where('employeeId', '==', employeeId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Return default permissions if none exist
        return NextResponse.json({
          success: true,
          permissions: null,
          message: 'No custom permissions set. Using default permissions.'
        });
      }

      const permissionDoc = querySnapshot.docs[0];
      return NextResponse.json({
        success: true,
        permissions: { id: permissionDoc.id, ...permissionDoc.data() }
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

// POST - Create permissions for an employee
export async function POST(request) {
  try {
    const data = await request.json();
    const { employeeId } = data;

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Check if permissions already exist for this employee
    const q = query(collection(db, PERMISSIONS_COLLECTION), where('employeeId', '==', employeeId));
    const existingSnapshot = await getDocs(q);

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { success: false, message: 'Permissions already exist for this employee. Use PUT to update.' },
        { status: 409 }
      );
    }

    // Default permissions structure
    const permissionsData = {
      employeeId,
      
      // Dashboard access
      dashboard: {
        view: data.dashboard?.view !== undefined ? data.dashboard.view : true
      },
      
      // Profile access
      profile: {
        view: data.profile?.view !== undefined ? data.profile.view : true,
        edit: data.profile?.edit !== undefined ? data.profile.edit : false
      },
      
      // Attendance access
      attendance: {
        view: data.attendance?.view !== undefined ? data.attendance.view : true,
        add: data.attendance?.add !== undefined ? data.attendance.add : false,
        edit: data.attendance?.edit !== undefined ? data.attendance.edit : false,
        delete: data.attendance?.delete !== undefined ? data.attendance.delete : false
      },
      
      // Leaves access
      leaves: {
        view: data.leaves?.view !== undefined ? data.leaves.view : true,
        add: data.leaves?.add !== undefined ? data.leaves.add : true,
        edit: data.leaves?.edit !== undefined ? data.leaves.edit : false,
        delete: data.leaves?.delete !== undefined ? data.leaves.delete : false
      },
      
      // Salary access
      salary: {
        view: data.salary?.view !== undefined ? data.salary.view : true
      },
      
      // Projects access
      projects: {
        view: data.projects?.view !== undefined ? data.projects.view : true,
        add: data.projects?.add !== undefined ? data.projects.add : false,
        edit: data.projects?.edit !== undefined ? data.projects.edit : false
      },
      
      // Tasks access
      tasks: {
        view: data.tasks?.view !== undefined ? data.tasks.view : true,
        add: data.tasks?.add !== undefined ? data.tasks.add : false,
        edit: data.tasks?.edit !== undefined ? data.tasks.edit : true,
        delete: data.tasks?.delete !== undefined ? data.tasks.delete : false
      },
      
      // Documents access
      documents: {
        view: data.documents?.view !== undefined ? data.documents.view : true,
        add: data.documents?.add !== undefined ? data.documents.add : false,
        edit: data.documents?.edit !== undefined ? data.documents.edit : false,
        delete: data.documents?.delete !== undefined ? data.documents.delete : false
      },
      
      // Sales access (for sales employees)
      sales: {
        view: data.sales?.view !== undefined ? data.sales.view : false,
        add: data.sales?.add !== undefined ? data.sales.add : false,
        edit: data.sales?.edit !== undefined ? data.sales.edit : false,
        delete: data.sales?.delete !== undefined ? data.sales.delete : false
      },
      
      // Reports access
      reports: {
        view: data.reports?.view !== undefined ? data.reports.view : false
      },
      
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, PERMISSIONS_COLLECTION), permissionsData);

    return NextResponse.json({
      success: true,
      message: 'Permissions created successfully',
      permissionId: docRef.id
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
    const { id, employeeId, ...permissionUpdates } = data;

    if (!id && !employeeId) {
      return NextResponse.json(
        { success: false, message: 'Permission ID or Employee ID is required' },
        { status: 400 }
      );
    }

    let permissionRef;

    if (id) {
      // Update by permission ID
      permissionRef = doc(db, PERMISSIONS_COLLECTION, id);
    } else {
      // Find permission by employee ID
      const q = query(collection(db, PERMISSIONS_COLLECTION), where('employeeId', '==', employeeId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return NextResponse.json(
          { success: false, message: 'Permission record not found' },
          { status: 404 }
        );
      }

      permissionRef = doc(db, PERMISSIONS_COLLECTION, querySnapshot.docs[0].id);
    }

    const permDoc = await getDoc(permissionRef);

    if (!permDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Permission record not found' },
        { status: 404 }
      );
    }

    await updateDoc(permissionRef, {
      ...permissionUpdates,
      updatedAt: Timestamp.now()
    });

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
    const employeeId = searchParams.get('employeeId');

    if (!id && !employeeId) {
      return NextResponse.json(
        { success: false, message: 'Permission ID or Employee ID is required' },
        { status: 400 }
      );
    }

    let permissionRef;

    if (id) {
      permissionRef = doc(db, PERMISSIONS_COLLECTION, id);
    } else {
      const q = query(collection(db, PERMISSIONS_COLLECTION), where('employeeId', '==', employeeId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return NextResponse.json(
          { success: false, message: 'Permission record not found' },
          { status: 404 }
        );
      }

      permissionRef = doc(db, PERMISSIONS_COLLECTION, querySnapshot.docs[0].id);
    }

    const permDoc = await getDoc(permissionRef);

    if (!permDoc.exists()) {
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
