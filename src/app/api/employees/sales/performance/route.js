import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const LEADS_COLLECTION = 'salesLeads';
const SALARY_RECORDS_COLLECTION = 'salaryRecords';
const EMPLOYEES_COLLECTION = 'employees';
const PROJECTS_COLLECTION = 'employeeProjects';

// GET - Fetch sales performance metrics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Verify employee exists and is a sales employee
    const employeeDoc = await getDoc(doc(db, EMPLOYEES_COLLECTION, employeeId));
    if (!employeeDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    const employee = employeeDoc.data();

    // Fetch all leads assigned to this employee
    const leadsQuery = query(
      collection(db, LEADS_COLLECTION),
      where('assignedTo', '==', employeeId)
    );
    const leadsSnapshot = await getDocs(leadsQuery);
    const leads = leadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate lead statistics
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => lead.status === 'New').length;
    const contactedLeads = leads.filter(lead => lead.status === 'Contacted').length;
    const interestedLeads = leads.filter(lead => lead.status === 'Interested').length;
    const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
    const lostLeads = leads.filter(lead => lead.status === 'Lost').length;

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0;

    // Calculate total estimated value
    const totalEstimatedValue = leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);
    const convertedValue = leads
      .filter(lead => lead.status === 'Converted')
      .reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);

    // Fetch salary records for commission calculation
    let salaryQuery = query(
      collection(db, SALARY_RECORDS_COLLECTION),
      where('employeeId', '==', employeeId)
    );
    const salarySnapshot = await getDocs(salaryQuery);
    let salaryRecords = salarySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by month and year if provided
    if (month && year) {
      salaryRecords = salaryRecords.filter(record => 
        record.month === month && record.year === parseInt(year)
      );
    }

    // Calculate total commission
    const totalCommission = salaryRecords.reduce((sum, record) => sum + (record.commission || 0), 0);
    const pendingCommission = salaryRecords
      .filter(record => record.paymentStatus === 'Pending')
      .reduce((sum, record) => sum + (record.commission || 0), 0);
    const paidCommission = salaryRecords
      .filter(record => record.paymentStatus === 'Paid')
      .reduce((sum, record) => sum + (record.commission || 0), 0);

    // Fetch completed projects
    const projectsQuery = query(
      collection(db, PROJECTS_COLLECTION),
      where('assignedEmployees', 'array-contains', employeeId)
    );
    const projectsSnapshot = await getDocs(projectsQuery);
    const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const completedProjects = projects.filter(project => project.status === 'Completed').length;
    const totalProjectValue = projects
      .filter(project => project.status === 'Completed')
      .reduce((sum, project) => sum + (project.projectValue || 0), 0);

    // Monthly sales target (if set in employee profile)
    const monthlySalesTarget = employee.monthlySalesTarget || 0;
    const targetAchievement = monthlySalesTarget > 0 
      ? ((convertedValue / monthlySalesTarget) * 100).toFixed(2) 
      : 0;

    // Performance summary
    const performanceData = {
      employeeId: employeeId,
      employeeName: employee.name,
      employeeIdNumber: employee.employeeId,
      
      // Lead statistics
      leads: {
        total: totalLeads,
        new: newLeads,
        contacted: contactedLeads,
        interested: interestedLeads,
        converted: convertedLeads,
        lost: lostLeads,
        conversionRate: `${conversionRate}%`
      },
      
      // Revenue statistics
      revenue: {
        totalEstimatedValue,
        convertedValue,
        totalProjectValue
      },
      
      // Commission statistics
      commission: {
        total: totalCommission,
        pending: pendingCommission,
        paid: paidCommission,
        commissionPercentage: employee.commissionPercentage || 0
      },
      
      // Project statistics
      projects: {
        total: projects.length,
        completed: completedProjects
      },
      
      // Target achievement
      target: {
        monthlySalesTarget,
        achieved: convertedValue,
        achievementPercentage: `${targetAchievement}%`
      },
      
      // Period
      period: month && year ? { month, year } : 'All Time'
    };

    return NextResponse.json({
      success: true,
      performance: performanceData
    });

  } catch (error) {
    console.error('Error fetching sales performance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sales performance', error: error.message },
      { status: 500 }
    );
  }
}
