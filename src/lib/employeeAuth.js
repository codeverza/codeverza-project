// Employee Authentication Helper Functions

/**
 * Check if employee is authenticated
 * @returns {Object|null} Employee data if authenticated, null otherwise
 */
export function getEmployeeAuth() {
  if (typeof window === 'undefined') return null;
  
  try {
    const authData = localStorage.getItem('employeeAuth');
    if (!authData) return null;

    const { isAuthenticated, employee, loginTime } = JSON.parse(authData);
    
    if (!isAuthenticated) return null;

    // Check if session is expired (24 hours)
    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      clearEmployeeAuth();
      return null;
    }

    return employee;
  } catch (error) {
    console.error('Error reading employee auth:', error);
    return null;
  }
}

/**
 * Set employee authentication data
 * @param {Object} employee - Employee data to store
 */
export function setEmployeeAuth(employee) {
  if (typeof window === 'undefined') return;
  
  try {
    const authData = {
      isAuthenticated: true,
      employee: employee,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('employeeAuth', JSON.stringify(authData));
  } catch (error) {
    console.error('Error setting employee auth:', error);
  }
}

/**
 * Clear employee authentication data (logout)
 */
export function clearEmployeeAuth() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('employeeAuth');
  } catch (error) {
    console.error('Error clearing employee auth:', error);
  }
}

/**
 * Check if employee has specific permission
 * @param {string} module - Module name (e.g., 'attendance', 'leaves')
 * @param {string} action - Action type (e.g., 'view', 'add', 'edit', 'delete')
 * @returns {boolean} True if employee has permission, false otherwise
 */
export function hasPermission(module, action) {
  const employee = getEmployeeAuth();
  if (!employee || !employee.permissions) return false;

  const modulePermissions = employee.permissions[module];
  if (!modulePermissions) return false;

  return modulePermissions[action] === true;
}

/**
 * Redirect to login if not authenticated
 * @param {Object} router - Next.js router instance
 * @returns {boolean} True if authenticated, false if redirected
 */
export function requireAuth(router) {
  const employee = getEmployeeAuth();
  
  if (!employee) {
    router.push('/employee/login');
    return false;
  }
  
  return true;
}

/**
 * Get session time remaining in hours
 * @returns {number|null} Hours remaining or null if not authenticated
 */
export function getSessionTimeRemaining() {
  const employee = getEmployeeAuth();
  if (!employee) return null;

  try {
    const authData = localStorage.getItem('employeeAuth');
    const { loginTime } = JSON.parse(authData);
    
    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
    
    return Math.max(0, 24 - hoursDiff);
  } catch (error) {
    return null;
  }
}

/**
 * Refresh session (extend login time)
 */
export function refreshSession() {
  const employee = getEmployeeAuth();
  if (employee) {
    setEmployeeAuth(employee);
  }
}

/**
 * Check if employee account is active
 * @returns {boolean} True if account is active
 */
export function isAccountActive() {
  const employee = getEmployeeAuth();
  return employee && employee.status !== 'Suspended' && employee.status !== 'Terminated';
}
