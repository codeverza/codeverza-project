import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// GET - Fetch all leads or filter by employee
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const id = searchParams.get('id');

    // Get single lead
    if (id) {
      const leadDoc = await getDoc(doc(db, 'leads', id));
      if (!leadDoc.exists()) {
        return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
      }
      return NextResponse.json({ 
        success: true, 
        lead: { id: leadDoc.id, ...leadDoc.data() } 
      });
    }

    // Get leads by employee or all leads
    let leadsQuery;
    if (employeeId) {
      leadsQuery = query(
        collection(db, 'leads'),
        where('createdBy', '==', employeeId),
        orderBy('createdAt', 'desc')
      );
    } else {
      leadsQuery = query(
        collection(db, 'leads'),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(leadsQuery);
    const leads = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// POST - Create new lead
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['clientName', 'serviceType', 'priority', 'source', 'createdBy', 'createdByName'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // If stage is Won, wonPrice is required
    if (data.stage === 'Won' && !data.wonPrice) {
      return NextResponse.json({ 
        success: false, 
        message: 'Won price is required when stage is Won' 
      }, { status: 400 });
    }

    if (data.stage === 'Quotation Sent' && (!data.expectedValue || parseFloat(data.expectedValue) <= 0)) {
      return NextResponse.json({
        success: false,
        message: 'Expected value is required when stage is Quotation Sent'
      }, { status: 400 });
    }

    // Prepare lead data
    const leadData = {
      // Client Details
      clientName: data.clientName,
      email: data.email || '',
      phone: data.phone || '',
      companyName: data.companyName || '',
      
      // Lead Details
      serviceType: data.serviceType,
      expectedValue: parseFloat(data.expectedValue) || 0,
      priority: data.priority, // Low, Medium, High, Urgent
      source: data.source, // Direct, Reference, Website, Social Media, etc.
      stage: data.stage || 'New', // Can be set during creation
      
      // Additional Info
      notes: data.notes || '',
      nextFollowUp: data.nextFollowUp || null,
      
      // Won Details (will be filled when stage becomes Won)
      wonPrice: data.wonPrice ? parseFloat(data.wonPrice) : null,
      wonDate: data.stage === 'Won' && data.wonPrice ? new Date().toISOString() : null,
      
      // Metadata
      createdBy: data.createdBy, // Employee ID
      createdByName: data.createdByName, // Employee Name
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Activity Log
      activityLog: [{
        action: 'Lead Created',
        performedBy: data.createdByName,
        performedAt: new Date().toISOString(),
        details: `Lead was created with stage: ${data.stage || 'New'}`
      }]
    };

    const docRef = await addDoc(collection(db, 'leads'), leadData);

    return NextResponse.json({ 
      success: true, 
      message: 'Lead created successfully',
      leadId: docRef.id 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// PUT - Update lead
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, updatedByName, ...updateFields } = data;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Lead ID is required' 
      }, { status: 400 });
    }

    const leadRef = doc(db, 'leads', id);
    const leadDoc = await getDoc(leadRef);

    if (!leadDoc.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Lead not found' 
      }, { status: 404 });
    }

    const existingData = leadDoc.data();

    // Prepare update data
    const updateData = {
      ...updateFields,
      updatedAt: serverTimestamp()
    };

    // If stage is being updated to Won, require wonPrice
    if (updateFields.stage === 'Won') {
      if (!updateFields.wonPrice || parseFloat(updateFields.wonPrice) <= 0) {
        return NextResponse.json({ 
          success: false, 
          message: 'Won price is required when marking lead as Won' 
        }, { status: 400 });
      }
      updateData.wonPrice = parseFloat(updateFields.wonPrice);
      updateData.wonDate = new Date().toISOString();
    }

    if (updateFields.stage === 'Quotation Sent') {
      if (!updateFields.expectedValue || parseFloat(updateFields.expectedValue) <= 0) {
        return NextResponse.json({
          success: false,
          message: 'Expected value is required when stage is Quotation Sent'
        }, { status: 400 });
      }
      updateData.expectedValue = parseFloat(updateFields.expectedValue);
    }

    if (updateFields.stage === 'Lost') {
      if (!updateFields.lossReason || !updateFields.lossReason.trim()) {
        return NextResponse.json({
          success: false,
          message: 'A loss reason is required when marking a lead as Lost'
        }, { status: 400 });
      }
      updateData.lossReason = updateFields.lossReason.trim();
    }

    // Add activity log entry
    const activityLog = existingData.activityLog || [];
    
    // Determine what changed
    let changeDescription = '';
    if (updateFields.stage && updateFields.stage !== existingData.stage) {
      changeDescription = `Stage changed from "${existingData.stage}" to "${updateFields.stage}"`;
    } else if (updateFields.notes && updateFields.notes !== existingData.notes) {
      changeDescription = 'Notes updated';
    } else {
      changeDescription = 'Lead information updated';
    }

    activityLog.push({
      action: 'Lead Updated',
      performedBy: updatedByName || 'Unknown',
      performedAt: new Date().toISOString(),
      details: changeDescription
    });

    updateData.activityLog = activityLog;

    await updateDoc(leadRef, updateData);

    // A won lead becomes a project assigned to the sales employee who created it.
    if (updateFields.stage === 'Won' && existingData.stage !== 'Won') {
      const existingProjects = await getDocs(query(
        collection(db, 'employeeProjects'),
        where('leadId', '==', id)
      ));

      if (existingProjects.empty) {
        const projectValue = parseFloat(updateFields.wonPrice);
        const installments = [
          { id: 'installment-1', number: 1, label: 'First Installment', percentage: 30, amount: projectValue * 0.3, status: 'Pending', payment: null },
          { id: 'installment-2', number: 2, label: 'Second Installment', percentage: 50, amount: projectValue * 0.5, status: 'Pending', payment: null },
          { id: 'installment-3', number: 3, label: 'Final Installment', percentage: 20, amount: projectValue * 0.2, status: 'Pending', payment: null }
        ];

        await addDoc(collection(db, 'employeeProjects'), {
          projectName: `${existingData.clientName || 'Client'} Project`,
          description: existingData.notes || '',
          clientName: existingData.clientName || '',
          clientEmail: existingData.email || '',
          clientPhone: existingData.phone || '',
          leadId: id,
          salesEmployeeId: existingData.createdBy,
          salesEmployeeName: existingData.createdByName || 'Employee',
          assignedEmployees: existingData.createdBy ? [existingData.createdBy] : [],
          employeeDetails: existingData.createdBy ? [{ id: existingData.createdBy, name: existingData.createdByName || 'Employee' }] : [],
          startDate: new Date().toISOString().split('T')[0],
          deadline: null,
          status: 'Active',
          priority: existingData.priority || 'Medium',
          projectValue,
          progress: 0,
          installments,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Lead updated successfully' 
    });

  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// DELETE - Delete lead
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Lead ID is required' 
      }, { status: 400 });
    }

    await deleteDoc(doc(db, 'leads', id));

    return NextResponse.json({ 
      success: true, 
      message: 'Lead deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
