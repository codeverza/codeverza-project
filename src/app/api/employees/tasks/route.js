import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const TASKS_COLLECTION = 'employeeTasks';
const EMPLOYEES_COLLECTION = 'employees';
const PROJECTS_COLLECTION = 'employeeProjects';

// GET - Fetch tasks
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    const employeeId = searchParams.get('employeeId');
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    if (taskId) {
      // Fetch single task
      const taskDoc = await getDoc(doc(db, TASKS_COLLECTION, taskId));
      
      if (!taskDoc.exists()) {
        return NextResponse.json(
          { success: false, message: 'Task not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        task: { id: taskDoc.id, ...taskDoc.data() }
      });
    }

    // Build query
    let tasksQuery = query(collection(db, TASKS_COLLECTION), orderBy('createdAt', 'desc'));

    if (employeeId) {
      tasksQuery = query(
        collection(db, TASKS_COLLECTION),
        where('assignedTo', '==', employeeId),
        orderBy('createdAt', 'desc')
      );
    } else if (projectId) {
      tasksQuery = query(
        collection(db, TASKS_COLLECTION),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(tasksQuery);
    let tasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply filters
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }
    if (priority) {
      tasks = tasks.filter(task => task.priority === priority);
    }

    return NextResponse.json({
      success: true,
      tasks,
      count: tasks.length
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tasks', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create task
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.assignedTo) {
      return NextResponse.json(
        { success: false, message: 'Task title and assigned employee are required' },
        { status: 400 }
      );
    }

    // Verify employee exists
    const employeeDoc = await getDoc(doc(db, EMPLOYEES_COLLECTION, data.assignedTo));
    if (!employeeDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Assigned employee not found' },
        { status: 404 }
      );
    }

    const employee = employeeDoc.data();

    // If projectId is provided, verify project exists
    let projectName = '';
    if (data.projectId) {
      const projectDoc = await getDoc(doc(db, PROJECTS_COLLECTION, data.projectId));
      if (projectDoc.exists()) {
        projectName = projectDoc.data().projectName;
      }
    }

    // Prepare task data
    const taskData = {
      title: data.title,
      description: data.description || '',
      assignedTo: data.assignedTo,
      assignedToName: employee.name,
      assignedToEmployeeId: employee.employeeId,
      projectId: data.projectId || null,
      projectName: projectName,
      status: data.status || 'To Do', // To Do, In Progress, Review, Completed
      priority: data.priority || 'Medium', // Low, Medium, High, Urgent
      deadline: data.deadline || null,
      estimatedHours: data.estimatedHours || 0,
      actualHours: data.actualHours || 0,
      progress: 0,
      startDate: data.startDate || null,
      completedDate: null,
      assignedBy: data.assignedBy || 'Admin',
      remarks: data.remarks || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, TASKS_COLLECTION), taskData);

    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      taskId: docRef.id,
      task: taskData
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create task', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update task
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Task ID is required' },
        { status: 400 }
      );
    }

    const taskRef = doc(db, TASKS_COLLECTION, id);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    const currentTask = taskDoc.data();

    // If status is being changed to Completed, set completion date
    if (updateData.status === 'Completed' && currentTask.status !== 'Completed') {
      updateData.completedDate = new Date().toISOString().split('T')[0];
      updateData.progress = 100;
    }

    // If reassigning task, update employee details
    if (updateData.assignedTo && updateData.assignedTo !== currentTask.assignedTo) {
      const employeeDoc = await getDoc(doc(db, EMPLOYEES_COLLECTION, updateData.assignedTo));
      if (employeeDoc.exists()) {
        const employee = employeeDoc.data();
        updateData.assignedToName = employee.name;
        updateData.assignedToEmployeeId = employee.employeeId;
      }
    }

    await updateDoc(taskRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update task', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete task
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Task ID is required' },
        { status: 400 }
      );
    }

    const taskRef = doc(db, TASKS_COLLECTION, id);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    await deleteDoc(taskRef);

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete task', error: error.message },
      { status: 500 }
    );
  }
}
