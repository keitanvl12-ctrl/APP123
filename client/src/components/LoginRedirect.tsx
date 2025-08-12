import { useEffect } from 'react';

export default function LoginRedirect() {
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const currentUser = localStorage.getItem('currentUser');

    if (!token || !currentUser) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  }, []);

  // Don't render anything, just handle redirect logic
  return null;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('authToken');
  const currentUser = localStorage.getItem('currentUser');
  return !!(token && currentUser);
}

// Logout function
export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  window.location.href = '/login';
}