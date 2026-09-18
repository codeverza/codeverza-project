import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const PROJECTS_COLLECTION = 'employeeProjects';
const EMPLOYEES_COLLECTION = 'employees';

const createProjectFromWonLead = async (leadDoc) => {
  const lead = leadDoc.data();
  const projectValue = Number(lead.wonPrice || lead.expectedValue || 0);
  if (!projectValue || projectValue <= 0) return false;

  const existingProject = await getDocs(query(
    collection(db, PROJECTS_COLLECTION),
    where('leadId', '==', leadDoc.id)
  ));
  if (!existingProject.empty) return false;

  const assignedEmployeeId = lead.createdBy || null;
  const assignedEmployeeName = lead.createdByName || 'Sales Employee';
  const installments = [
    { id: 'installment-1', number: 1, label: 'First Installment', percentage: 30, amount: projectValue * 0.3, status: 'Pending', payment: null },
    { id: 'installment-2', number: 2, label: 'Second Installment', percentage: 50, amount: projectValue * 0.5, status: 'Pending', payment: null },
    { id: 'installment-3', number: 3, label: 'Final Installment', percentage: 20, amount: projectValue * 0.2, status: 'Pending', payment: null }
  ];

  await addDoc(collection(db, PROJECTS_COLLECTION), {
    projectName: `${lead.clientName || 'Client'} Project`,
    description: lead.notes || '',
    clientName: lead.clientName || '',
    clientEmail: lead.email || '',
    clientPhone: lead.phone || '',
    leadId: leadDoc.id,
    salesEmployeeId: assignedEmployeeId,
    salesEmployeeName: assignedEmployeeName,
    assignedEmployees: assignedEmployeeId ? [assignedEmployeeId] : [],
    employeeDetails: assignedEmployeeId ? [{ id: assignedEmployeeId, name: assignedEmployeeName }] : [],
    startDate: new Date().toISOString().split('T')[0],
    deadline: null,
    status: 'Active',
    priority: lead.priority || 'Medium',
    projectValue,
    progress: 0,
    installments,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return true;
};

const migrateInstallmentPlan = async (projectDoc) => {
  const project = projectDoc.data();
  const projectValue = Number(project.projectValue || 0);
  if (!projectValue || !Array.isArray(project.installments) || project.installments.length !== 3) return;

  const percentages = [30, 50, 20];
  const hasNewPlan = project.installments.every((installment, index) => installment.percentage === percentages[index]);
  if (hasNewPlan) return;

  const installments = project.installments.map((installment, index) => ({
    ...installment,
    percentage: percentages[index],
    amount: projectValue * (percentages[index] / 100)
  }));

  await updateDoc(doc(db, PROJECTS_COLLECTION, projectDoc.id), {
    installments,
    updatedAt: Timestamp.now()
  });
};

const syncWonLeadProjects = async () => {
  const wonLeads = await getDocs(query(collection(db, 'leads'), where('stage', '==', 'Won')));
  for (const leadDoc of wonLeads.docs) {
    await createProjectFromWonLead(leadDoc);
  }

  const projects = await getDocs(collection(db, PROJECTS_COLLECTION));
  for (const projectDoc of projects.docs) {
    await migrateInstallmentPlan(projectDoc);
  }
};

// GET - Fetch projects
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    if (projectId) {
      // Fetch single project
      const projectDoc = await getDoc(doc(db, PROJECTS_COLLECTION, projectId));
      
      if (!projectDoc.exists()) {
        return NextResponse.json(
          { success: false, message: 'Project not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        project: { id: projectDoc.id, ...projectDoc.data() }
      });
    }

    // Repair projects for Won leads created before automatic project creation was enabled.
    await syncWonLeadProjects();

    // Build query
    let projectsQuery;
    
    if (employeeId) {
      projectsQuery = query(
        collection(db, PROJECTS_COLLECTION),
        where('assignedEmployees', 'array-contains', employeeId)
      );
    } else {
      projectsQuery = query(collection(db, PROJECTS_COLLECTION));
    }

    const querySnapshot = await getDocs(projectsQuery);
    let projects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((first, second) => {
      const firstDate = first.createdAt?.toMillis?.() || 0;
      const secondDate = second.createdAt?.toMillis?.() || 0;
      return secondDate - firstDate;
    });

    // Apply status filter
    if (status) {
      projects = projects.filter(project => project.status === status);
    }

    return NextResponse.json({
      success: true,
      projects,
      count: projects.length
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch projects', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create project and assign to employees
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.projectName || !data.assignedEmployees || data.assignedEmployees.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Project name and at least one assigned employee are required' },
        { status: 400 }
      );
    }

    // Verify all assigned employees exist
    const employeeDetails = [];
    for (const empId of data.assignedEmployees) {
      const empDoc = await getDoc(doc(db, EMPLOYEES_COLLECTION, empId));
      if (empDoc.exists()) {
        employeeDetails.push({
          id: empId,
          name: empDoc.data().name,
          employeeId: empDoc.data().employeeId
        });
      }
    }

    // Prepare project data
    const projectData = {
      projectName: data.projectName,
      description: data.description || '',
      clientName: data.clientName || '',
      assignedEmployees: data.assignedEmployees,
      employeeDetails: employeeDetails,
      startDate: data.startDate || null,
      deadline: data.deadline || null,
      status: data.status || 'Active', // Active, In Progress, Completed, On Hold, Cancelled
      priority: data.priority || 'Medium', // Low, Medium, High, Urgent
      projectValue: data.projectValue || 0,
      progress: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), projectData);

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      projectId: docRef.id,
      project: projectData
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create project', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update project
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      );
    }

    const projectRef = doc(db, PROJECTS_COLLECTION, id);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    // If updating assigned employees, fetch their details
    if (updateData.assignedEmployees) {
      const employeeDetails = [];
      for (const empId of updateData.assignedEmployees) {
        const empDoc = await getDoc(doc(db, EMPLOYEES_COLLECTION, empId));
        if (empDoc.exists()) {
          employeeDetails.push({
            id: empId,
            name: empDoc.data().name,
            employeeId: empDoc.data().employeeId
          });
        }
      }
      updateData.employeeDetails = employeeDetails;
    }

    await updateDoc(projectRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully'
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update project', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete project
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      );
    }

    const projectRef = doc(db, PROJECTS_COLLECTION, id);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    await deleteDoc(projectRef);

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete project', error: error.message },
      { status: 500 }
    );
  }
}
