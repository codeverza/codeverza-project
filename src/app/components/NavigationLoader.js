'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import './GlobalLoader.css';

export default function NavigationLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');

  useEffect(() => {
    // Determine loading text based on pathname
    const getLoadingText = (path) => {
      if (path.includes('/admin/quotations/preview')) return 'Loading Quotation Preview';
      if (path.includes('/admin/quotations/create')) return 'Loading Create Quotation';
      if (path.includes('/admin/quotations/edit')) return 'Loading Edit Quotation';
      if (path.includes('/admin/quotations')) return 'Loading Quotations';
      
      if (path.includes('/admin/joining-letters/preview')) return 'Loading Letter Preview';
      if (path.includes('/admin/joining-letters/create')) return 'Loading Create Letter';
      if (path.includes('/admin/joining-letters')) return 'Loading Joining Letters';
      
      if (path.includes('/admin/employees/create')) return 'Loading Create Employee';
      if (path.includes('/admin/employees/edit')) return 'Loading Edit Employee';
      if (path.includes('/admin/employees/view')) return 'Loading Employee Details';
      if (path.includes('/admin/employees/attendance')) return 'Loading Attendance';
      if (path.includes('/admin/employees/leaves')) return 'Loading Leave Requests';
      if (path.includes('/admin/employees/salary')) return 'Loading Salary Management';
      if (path.includes('/admin/employees/projects')) return 'Loading Projects';
      if (path.includes('/admin/employees/sales')) return 'Loading Sales';
      if (path.includes('/admin/employees/documents')) return 'Loading Documents';
      if (path.includes('/admin/employees/performance')) return 'Loading Performance';
      if (path.includes('/admin/employees/permissions')) return 'Loading Permissions';
      if (path.includes('/admin/employees')) return 'Loading Employees';
      
      if (path.includes('/admin/dashboard')) return 'Loading Admin Dashboard';
      if (path.includes('/admin')) return 'Loading Admin Panel';
      
      if (path.includes('/employee/dashboard')) return 'Loading Employee Dashboard';
      if (path.includes('/employee/login')) return 'Loading Login';
      if (path.includes('/employee/attendance')) return 'Loading My Attendance';
      if (path.includes('/employee/leaves')) return 'Loading My Leaves';
      if (path.includes('/employee/salary')) return 'Loading My Salary';
      if (path.includes('/employee/documents')) return 'Loading My Documents';
      if (path.includes('/employee')) return 'Loading Employee Portal';
      
      if (path.includes('/about-page')) return 'Loading About Us';
      if (path.includes('/contact-page')) return 'Loading Contact';
      if (path.includes('/services')) return 'Loading Services';
      if (path.includes('/portfolio')) return 'Loading Portfolio';
      if (path === '/') return 'Loading Home';
      
      return 'Loading Page';
    };

    setLoadingText(getLoadingText(pathname));
  }, [pathname]);

  // Show loader briefly on route change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); // Show loader for 800ms on each navigation

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="global-loader-overlay">
      <div className="global-loader-container">
        <div className="global-loader">
          <div className="loader-circle"></div>
          <div className="loader-circle"></div>
          <div className="loader-circle"></div>
          <div className="loader-logo">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
        </div>
        <p className="global-loader-text">{loadingText}</p>
        <div className="loader-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
