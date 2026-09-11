'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import './GlobalLoader.css';

export default function GlobalLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');

  useEffect(() => {
    // Determine loading text based on pathname
    const getLoadingText = (path) => {
      if (path.includes('/admin/quotations')) return 'Loading Quotations';
      if (path.includes('/admin/joining-letters')) return 'Loading Joining Letters';
      if (path.includes('/admin/employees')) return 'Loading Employees';
      if (path.includes('/admin/dashboard')) return 'Loading Admin Dashboard';
      if (path.includes('/admin')) return 'Loading Admin Panel';
      if (path.includes('/employee/dashboard')) return 'Loading Employee Dashboard';
      if (path.includes('/employee/login')) return 'Loading Login';
      if (path.includes('/employee')) return 'Loading Employee Portal';
      if (path.includes('/about-page')) return 'Loading About Us';
      if (path.includes('/contact-page')) return 'Loading Contact';
      if (path.includes('/services')) return 'Loading Services';
      if (path.includes('/portfolio')) return 'Loading Portfolio';
      if (path === '/') return 'Loading Home';
      return 'Loading Page';
    };

    setLoadingText(getLoadingText(pathname));
    setLoading(false);
  }, [pathname, searchParams]);

  // Show loader on navigation start
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    // Listen for route changes
    window.addEventListener('beforeunload', handleStart);

    return () => {
      window.removeEventListener('beforeunload', handleStart);
    };
  }, []);

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
