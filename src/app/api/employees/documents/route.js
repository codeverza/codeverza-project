import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const DOCUMENTS_COLLECTION = 'employeeDocuments';
const EMPLOYEES_COLLECTION = 'employees';

// GET - Fetch documents
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');
    const employeeId = searchParams.get('employeeId');
    const documentType = searchParams.get('documentType');
    const expired = searchParams.get('expired'); // 'true' or 'false'

    if (documentId) {
      // Fetch single document
      const documentDoc = await getDoc(doc(db, DOCUMENTS_COLLECTION, documentId));
      
      if (!documentDoc.exists()) {
        return NextResponse.json(
          { success: false, message: 'Document not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        document: { id: documentDoc.id, ...documentDoc.data() }
      });
    }

    // Build query
    let documentsQuery;
    
    if (employeeId) {
      documentsQuery = query(
        collection(db, DOCUMENTS_COLLECTION),
        where('employeeId', '==', employeeId),
        orderBy('uploadedAt', 'desc')
      );
    } else {
      documentsQuery = query(collection(db, DOCUMENTS_COLLECTION), orderBy('uploadedAt', 'desc'));
    }

    const querySnapshot = await getDocs(documentsQuery);
    let documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply filters
    if (documentType) {
      documents = documents.filter(doc => doc.documentType === documentType);
    }

    // Filter expired documents
    if (expired === 'true') {
      const today = new Date().toISOString().split('T')[0];
      documents = documents.filter(doc => doc.expiryDate && doc.expiryDate < today);
    } else if (expired === 'false') {
      const today = new Date().toISOString().split('T')[0];
      documents = documents.filter(doc => !doc.expiryDate || doc.expiryDate >= today);
    }

    return NextResponse.json({
      success: true,
      documents,
      count: documents.length
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch documents', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Upload document
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.employeeId || !data.documentType || !data.documentUrl) {
      return NextResponse.json(
        { success: false, message: 'Employee ID, document type, and document URL are required' },
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

    // Check expiry date and calculate days until expiry
    let daysUntilExpiry = null;
    let isExpired = false;
    
    if (data.expiryDate) {
      const today = new Date();
      const expiryDate = new Date(data.expiryDate);
      const diffTime = expiryDate - today;
      daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isExpired = daysUntilExpiry < 0;
    }

    // Prepare document data
    const documentData = {
      employeeId: data.employeeId,
      employeeName: employee.name,
      employeeIdNumber: employee.employeeId,
      documentType: data.documentType, // CV, CNIC, Joining Letter, Employment Agreement, Educational Certificate, Experience Letter, Salary Agreement, etc.
      documentName: data.documentName || data.documentType,
      documentUrl: data.documentUrl,
      documentSize: data.documentSize || '',
      expiryDate: data.expiryDate || null,
      daysUntilExpiry: daysUntilExpiry,
      isExpired: isExpired,
      issueDate: data.issueDate || null,
      issuedBy: data.issuedBy || '',
      notes: data.notes || '',
      uploadedBy: data.uploadedBy || 'Admin',
      uploadedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), documentData);

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      documentId: docRef.id,
      document: documentData
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload document', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update document
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Document ID is required' },
        { status: 400 }
      );
    }

    const documentRef = doc(db, DOCUMENTS_COLLECTION, id);
    const documentDoc = await getDoc(documentRef);

    if (!documentDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      );
    }

    // Recalculate expiry if expiry date is being updated
    if (updateData.expiryDate) {
      const today = new Date();
      const expiryDate = new Date(updateData.expiryDate);
      const diffTime = expiryDate - today;
      updateData.daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      updateData.isExpired = updateData.daysUntilExpiry < 0;
    }

    await updateDoc(documentRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully'
    });

  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update document', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete document
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Document ID is required' },
        { status: 400 }
      );
    }

    const documentRef = doc(db, DOCUMENTS_COLLECTION, id);
    const documentDoc = await getDoc(documentRef);

    if (!documentDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      );
    }

    await deleteDoc(documentRef);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete document', error: error.message },
      { status: 500 }
    );
  }
}
