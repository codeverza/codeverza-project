import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { NextResponse } from 'next/server';

const PROJECTS_COLLECTION = 'employeeProjects';

const getProject = async (projectId) => {
  const projectDoc = await getDoc(doc(db, PROJECTS_COLLECTION, projectId));
  return projectDoc.exists() ? { id: projectDoc.id, ...projectDoc.data() } : null;
};

const saveInstallments = async (project, installments) => {
  await updateDoc(doc(db, PROJECTS_COLLECTION, project.id), {
    installments,
    updatedAt: Timestamp.now()
  });
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const employeeId = searchParams.get('employeeId');

    if (projectId) {
      const project = await getProject(projectId);
      if (!project) return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
      return NextResponse.json({ success: true, installments: project.installments || [] });
    }

    const projectsQuery = employeeId
      ? query(collection(db, PROJECTS_COLLECTION), where('assignedEmployees', 'array-contains', employeeId))
      : query(collection(db, PROJECTS_COLLECTION));
    const snapshot = await getDocs(projectsQuery);
    const payments = snapshot.docs.flatMap((projectDoc) => {
      const project = projectDoc.data();
      return (project.installments || [])
        .filter((installment) => installment.payment)
        .map((installment) => ({ projectId: projectDoc.id, projectName: project.projectName, clientName: project.clientName, installment }));
    });

    return NextResponse.json({ success: true, payments });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Employee submits a payment; admin advances it through the approval workflow.
export async function POST(request) {
  try {
    const data = await request.json();
    const { projectId, installmentId, method, amount, proof, note, submittedBy, submittedByName } = data;
    const allowedMethods = ['online', 'cheque', 'cash'];

    if (!projectId || !installmentId || !allowedMethods.includes(method) || !amount || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Project, installment, method and valid amount are required' }, { status: 400 });
    }
    if ((method === 'online' || method === 'cheque') && !proof) {
      return NextResponse.json({ success: false, message: 'Payment proof is required for online payment or cheque' }, { status: 400 });
    }

    const project = await getProject(projectId);
    if (!project) return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });

    const installments = project.installments || [];
    const installmentIndex = installments.findIndex((item) => item.id === installmentId);
    if (installmentIndex < 0) return NextResponse.json({ success: false, message: 'Installment not found' }, { status: 404 });
    if (installmentIndex > 0 && installments[installmentIndex - 1].status !== 'Approved') {
      return NextResponse.json({
        success: false,
        message: 'Previous installment must be approved before submitting this payment'
      }, { status: 400 });
    }
    if (installments[installmentIndex].status === 'Approved') {
      return NextResponse.json({ success: false, message: 'This installment is already approved' }, { status: 400 });
    }

    installments[installmentIndex] = {
      ...installments[installmentIndex],
      status: 'Submitted',
      payment: {
        method,
        amount: parseFloat(amount),
        proof: proof || null,
        note: note || '',
        submittedBy: submittedBy || null,
        submittedByName: submittedByName || 'Employee',
        submittedAt: new Date().toISOString(),
        adminNote: ''
      }
    };
    await saveInstallments(project, installments);
    return NextResponse.json({ success: true, message: 'Payment submitted for admin review' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Admin actions: online approve, cash receive/not receive, cheque received/clear/return.
export async function PUT(request) {
  try {
    const data = await request.json();
    const { projectId, installmentId, action, adminNote } = data;
    const project = await getProject(projectId);
    if (!project) return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });

    const installments = project.installments || [];
    const installmentIndex = installments.findIndex((item) => item.id === installmentId);
    if (installmentIndex < 0) return NextResponse.json({ success: false, message: 'Installment not found' }, { status: 404 });

    const installment = installments[installmentIndex];
    if (!installment.payment) return NextResponse.json({ success: false, message: 'No payment has been submitted' }, { status: 400 });

    const transitions = {
      approve_online: { method: 'online', status: 'Approved' },
      cash_received: { method: 'cash', status: 'Approved' },
      cash_not_received: { method: 'cash', status: 'Not Received' },
      cheque_received: { method: 'cheque', status: 'Received' },
      cheque_clearance: { method: 'cheque', status: 'In Clearance' },
      cheque_clear: { method: 'cheque', status: 'Approved' },
      cheque_return: { method: 'cheque', status: 'Returned' }
    };
    const transition = transitions[action];
    if (!transition || installment.payment.method !== transition.method) {
      return NextResponse.json({ success: false, message: 'Invalid payment action' }, { status: 400 });
    }

    installments[installmentIndex] = {
      ...installment,
      status: transition.status,
      payment: {
        ...installment.payment,
        adminNote: adminNote || installment.payment.adminNote || '',
        lastAction: action,
        reviewedAt: new Date().toISOString()
      }
    };
    await saveInstallments(project, installments);
    return NextResponse.json({ success: true, message: `Payment marked as ${transition.status}` });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
