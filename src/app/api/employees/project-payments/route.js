import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc
} from 'firebase/firestore';
import { NextResponse } from 'next/server';

const PROJECTS_COLLECTION = 'employeeProjects';
const MAX_PAYMENT_PROOF_BYTES = 600 * 1024;

const getProjectWithPayments = async (projectId, project) => {
  const paymentsSnapshot = await getDocs(
    collection(db, PROJECTS_COLLECTION, projectId, 'payments')
  );
  const paymentWorkflow = {
    ...(project.paymentWorkflow || {}),
    ...Object.fromEntries(paymentsSnapshot.docs.map((paymentDoc) => [paymentDoc.id, paymentDoc.data()]))
  };

  return {
    id: projectId,
    ...project,
    installments: (project.installments || []).map((installment) => {
      const workflow = paymentWorkflow[installment.id];
      return workflow
        ? { ...installment, status: workflow.status, payment: workflow.payment }
        : installment;
    })
  };
};

const getProject = async (projectId, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const projectDoc = await getDoc(doc(db, PROJECTS_COLLECTION, projectId));
      return projectDoc.exists()
        ? await getProjectWithPayments(projectDoc.id, projectDoc.data())
        : null;
    } catch (error) {
      // If it's an offline error and we have retries left, wait and retry
      if (error.code === 'unavailable' && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        continue;
      }
      throw error; // If not offline error or no retries left, throw
    }
  }
};

const savePaymentWorkflow = async (project, installmentId, workflow) => {
  await setDoc(
    doc(db, PROJECTS_COLLECTION, project.id, 'payments', installmentId),
    workflow
  );
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
    const payments = (await Promise.all(snapshot.docs.map(async (projectDoc) => {
      const project = await getProjectWithPayments(projectDoc.id, projectDoc.data());
      return project.installments
        .filter((installment) => installment.payment)
        .map((installment) => ({ projectId: projectDoc.id, projectName: project.projectName, clientName: project.clientName, installment }));
    }))).flat();

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
    if (proof != null && typeof proof !== 'string') {
      return NextResponse.json({ success: false, message: 'Payment proof must be an image' }, { status: 400 });
    }
    const encodedProof = typeof proof === 'string' ? proof.slice(proof.indexOf(',') + 1) : '';
    const proofBytes = Math.floor(encodedProof.length * 3 / 4);
    if (proofBytes > MAX_PAYMENT_PROOF_BYTES) {
      return NextResponse.json({
        success: false,
        message: 'Payment proof could not be optimized enough to submit. Please choose a smaller image.'
      }, { status: 413 });
    }
    if ((note != null && typeof note !== 'string') || (note?.length || 0) > 2000) {
      return NextResponse.json({ success: false, message: 'Payment details must be 2,000 characters or fewer' }, { status: 400 });
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

    // Create clean payment object without any Date instances or undefined values
    const paymentData = {
      method: method || 'cash',
      amount: parseFloat(amount) || 0,
      proof: proof || null,
      note: typeof note === 'string' ? note : '',
      submittedBy: typeof submittedBy === 'string' ? submittedBy : null,
      submittedByName: typeof submittedByName === 'string' ? submittedByName : 'Employee',
      submittedAt: new Date().toISOString(),
      adminNote: ''
    };

    const currentInstallment = installments[installmentIndex];
    const workflow = {
      status: 'Submitted',
      payment: paymentData
    };

    await savePaymentWorkflow(project, currentInstallment.id, workflow);
    return NextResponse.json({ success: true, message: 'Payment submitted for admin review' });
  } catch (error) {
    console.error('Payment submission error:', error);

    // Provide user-friendly error messages
    let errorMessage = error.message;
    if (error.code === 'unavailable' || errorMessage.includes('offline')) {
      errorMessage = 'Connection issue. Please check your internet connection and try again.';
    } else if (errorMessage.includes('permission-denied')) {
      errorMessage = 'Permission denied. Please contact administrator.';
    }

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
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

    // Create clean updated installment without Date instances or undefined values
    const currentPayment = installment.payment;
    const updatedPayment = {
      method: currentPayment.method || 'cash',
      amount: currentPayment.amount || 0,
      proof: currentPayment.proof || null,
      note: currentPayment.note || '',
      submittedBy: currentPayment.submittedBy || null,
      submittedByName: currentPayment.submittedByName || 'Employee',
      submittedAt: currentPayment.submittedAt || new Date().toISOString(),
      adminNote: adminNote || currentPayment.adminNote || '',
      lastAction: action || '',
      reviewedAt: new Date().toISOString()
    };

    const workflow = {
      status: transition.status,
      payment: updatedPayment
    };

    await savePaymentWorkflow(project, installment.id, workflow);
    return NextResponse.json({ success: true, message: `Payment marked as ${transition.status}` });
  } catch (error) {
    console.error('Payment update error:', error);

    // Provide user-friendly error messages
    let errorMessage = error.message;
    if (error.code === 'unavailable' || errorMessage.includes('offline')) {
      errorMessage = 'Connection issue. Please check your internet connection and try again.';
    } else if (errorMessage.includes('permission-denied')) {
      errorMessage = 'Permission denied. Please contact administrator.';
    }

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
