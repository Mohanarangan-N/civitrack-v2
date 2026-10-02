import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';
import { AccessDeniedPage } from '@/pages/AccessDeniedPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  pageTitle?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
  pageTitle = 'Protected Zone',
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // 1. Check Authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check Role Authorization
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    const isAllowed = userRole && allowedRoles.includes(userRole);

    if (!isAllowed) {
      return (
        <AccessDeniedPage
          requiredRole={allowedRoles.join(' or ')}
          pageTitle={pageTitle}
        />
      );
    }
  }

  return <>{children}</>;
};
