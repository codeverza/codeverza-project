'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEmployeeAuth, clearEmployeeAuth } from '@/lib/employeeAuth';

/**
 * Protected Route Component for Employee Pages
 * Automatically redirects to login if not authenticated
 */
export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
    
    // Set up session check interval (every 5 minutes)
    const interval = setInterval(() => {
      checkAuthentication();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const checkAuthentication = () => {
    const employee = getEmployeeAuth();
    
    if (!employee) {
      setIsAuthenticated(false);
      setIsLoading(false);
      router.push('/employee/login');
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        background: '#f7fafc'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e2e8f0',
          borderTopColor: '#667eea',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <p style={{ color: '#718096', fontSize: '16px' }}>Verifying authentication...</p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
