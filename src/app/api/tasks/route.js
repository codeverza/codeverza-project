import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// GET - Fetch all tasks or single task
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    // Get single task
    if (taskId) {
      const taskDoc = await getDoc(doc(db, 'tasks', taskId));
      if (!taskDoc.exists()) {
        return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json({ 
        success: true, 
        task: { id: taskDoc.id, ...taskDoc.data() } 
      });
    }

    // Build query
    let tasksQuery = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));

    // Filter by employee
    if (employeeId) {
      tasksQuery = query(collection(db, 'tasks'), where('assignedTo', '==', employeeId), orderBy('createdAt', 'desc'));
    }

    // Filter by status
    if (status) {
      tasksQuery = query(collection(db, 'tasks'), where('status', '==', status), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(tasksQuery);
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST - Create new task
export async function POST(request) {
  try {
    const data = await request.json();
    
    const taskData = {
      taskTitle: data.taskTitle,
      taskDescription: data.taskDescription,
      assignedTo: data.assignedTo, // Employee ID
      assignedToName: data.assignedToName, // Employee Name
      priority: data.priority || 'Medium', // Low, Medium, High, Urgent
      deadline: data.deadline,
      projectId: data.projectId || null,
      projectName: data.projectName || null,
      status: 'To Do', // To Do, In Progress, Completed, Approved, Rejected
      progress: 0,
      completionReport: null,
      completedAt: null,
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null,
      createdBy: data.createdBy || 'Admin',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'tasks'), taskData);

    return NextResponse.json({ 
      success: true, 
      message: 'Task created successfully',
      taskId: docRef.id 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT - Update task
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Task ID is required' }, { status: 400 });
    }

    const taskRef = doc(db, 'tasks', id);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
    }

    // Update timestamp
    updateData.updatedAt = Timestamp.now();

    // If marking as completed, add completedAt timestamp
    if (updateData.status === 'Completed' && !taskDoc.data().completedAt) {
      updateData.completedAt = Timestamp.now();
      updateData.progress = 100;
    }

    // If approving task
    if (updateData.status === 'Approved') {
      updateData.approvedAt = Timestamp.now();
      updateData.progress = 100;
    }

    // If rejecting task
    if (updateData.status === 'Rejected') {
      updateData.progress = taskDoc.data().progress; // Keep previous progress
    }

    await updateDoc(taskRef, updateData);

    return NextResponse.json({ 
      success: true, 
      message: 'Task updated successfully' 
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE - Delete task
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ success: false, message: 'Task ID is required' }, { status: 400 });
    }

    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
    }

    await deleteDoc(taskRef);

    return NextResponse.json({ 
      success: true, 
      message: 'Task deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
